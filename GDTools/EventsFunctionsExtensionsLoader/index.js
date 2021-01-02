const { mapVector, mapFor } = require("../MapFor");
const { caseSensitiveSlug } = require("../CaseSensitiveSlug");
const {
  declareInstructionOrExpressionMetadata,
  declareBehaviorInstructionOrExpressionMetadata,
  declareEventsFunctionParameters,
  declareBehaviorMetadata,
  declareExtension,
  isBehaviorLifecycleEventsFunction,
  isExtensionLifecycleEventsFunction,
  declareBehaviorPropertiesInstructionAndExpressions,
} = require("./MetadataDeclarationHelpers");

const mangleName = (name) => {
  return caseSensitiveSlug(name, "_", []);
};

/** Generate the namespace for a free function. */
const getFreeFunctionCodeNamespace = (eventsFunction, codeNamespacePrefix) => {
  return codeNamespacePrefix + "__" + mangleName(eventsFunction.getName());
};

/** Generate the namespace for a behavior function. */
const getBehaviorFunctionCodeNamespace = (
  eventsBasedBehavior,
  codeNamespacePrefix
) => {
  return codeNamespacePrefix + "__" + mangleName(eventsBasedBehavior.getName());
};

/**
 * Load all events functions of a project in extensions
 */
const loadProjectEventsFunctionsExtensions = (
  project,
  eventsFunctionCodeWriter
) => {
  return Promise.all(
    // First pass: generate extensions from the events functions extensions,
    // without writing code for the functions. This is useful as events in functions
    // could be using other functions, which would not yet be available as
    // extensions.
    mapFor(0, project.getEventsFunctionsExtensionsCount(), (i) => {
      return loadProjectEventsFunctionsExtension(
        project,
        project.getEventsFunctionsExtensionAt(i),
        { skipCodeGeneration: true, eventsFunctionCodeWriter }
      );
    })
  ).then(() =>
    Promise.all(
      // Second pass: generate extensions, including code.
      mapFor(0, project.getEventsFunctionsExtensionsCount(), (i) => {
        return loadProjectEventsFunctionsExtension(
          project,
          project.getEventsFunctionsExtensionAt(i),
          {
            skipCodeGeneration: false,
            eventsFunctionCodeWriter,
          }
        );
      })
    )
  );
};
module.exports.loadProjectEventsFunctionsExtensions = loadProjectEventsFunctionsExtensions;

const loadProjectEventsFunctionsExtension = (
  project,
  eventsFunctionsExtension,
  options
) => {
  return generateEventsFunctionExtension(
    project,
    eventsFunctionsExtension,
    options
  ).then((extension) => {
    _GD.JsPlatform.get().addNewExtension(extension);
    extension.delete();
  });
};

/**
 * Get the list of mandatory include files when using the
 * extension.
 */
const getExtensionIncludeFiles = (
  project,
  eventsFunctionsExtension,
  options,
  codeNamespacePrefix
) => {
  return mapFor(0, eventsFunctionsExtension.getEventsFunctionsCount(), (i) => {
    const eventsFunction = eventsFunctionsExtension.getEventsFunctionAt(i);

    if (isExtensionLifecycleEventsFunction(eventsFunction.getName())) {
      const codeNamespace = getFreeFunctionCodeNamespace(
        eventsFunction,
        codeNamespacePrefix
      );
      const functionName = codeNamespace + ".func"; // TODO

      return options.eventsFunctionCodeWriter.getIncludeFileFor(functionName);
    }

    return null;
  }).filter(Boolean);
};

/**
 * Generate the code for the events based extension
 */
const generateEventsFunctionExtension = (
  project,
  eventsFunctionsExtension,
  options
) => {
  const extension = new _GD.PlatformExtension();
  declareExtension(extension, eventsFunctionsExtension);

  const codeNamespacePrefix =
    "gdjs.evtsExt__" + mangleName(eventsFunctionsExtension.getName());

  const extensionIncludeFiles = getExtensionIncludeFiles(
    project,
    eventsFunctionsExtension,
    options,
    codeNamespacePrefix
  );
  const codeGenerationContext = {
    codeNamespacePrefix,
    extensionIncludeFiles,
  };

  return Promise.all(
    // Generate all behaviors and their functions
    mapVector(
      eventsFunctionsExtension.getEventsBasedBehaviors(),
      (eventsBasedBehavior) => {
        return generateBehavior(
          project,
          extension,
          eventsFunctionsExtension,
          eventsBasedBehavior,
          options,
          codeGenerationContext
        );
      }
    )
  )
    .then(() =>
      // Generate all free functions
      Promise.all(
        mapFor(0, eventsFunctionsExtension.getEventsFunctionsCount(), (i) => {
          const eventsFunction = eventsFunctionsExtension.getEventsFunctionAt(
            i
          );
          return generateFreeFunction(
            project,
            extension,
            eventsFunctionsExtension,
            eventsFunction,
            options,
            codeGenerationContext
          );
        })
      )
    )
    .then(() => extension);
};

const generateFreeFunction = (
  project,
  extension,
  eventsFunctionsExtension,
  eventsFunction,
  options,
  codeGenerationContext
) => {
  const instructionOrExpression = declareInstructionOrExpressionMetadata(
    extension,
    eventsFunctionsExtension,
    eventsFunction
  );
  // By convention, first parameter is always the Runtime Scene.
  instructionOrExpression.addCodeOnlyParameter("currentScene", "");
  declareEventsFunctionParameters(eventsFunction, instructionOrExpression);

  // Hide "lifecycle" functions as they are called automatically by
  // the game engine.
  if (isExtensionLifecycleEventsFunction(eventsFunction.getName())) {
    instructionOrExpression.setHidden();
  }

  const codeNamespace = getFreeFunctionCodeNamespace(
    eventsFunction,
    codeGenerationContext.codeNamespacePrefix
  );
  const functionName = codeNamespace + ".func";

  const codeExtraInformation = instructionOrExpression.getCodeExtraInformation();
  codeExtraInformation
    .setIncludeFile(
      options.eventsFunctionCodeWriter.getIncludeFileFor(functionName)
    )
    .setFunctionName(functionName);

  // Always include the extension include files when using a free function.
  codeGenerationContext.extensionIncludeFiles.forEach((includeFile) => {
    codeExtraInformation.addIncludeFile(includeFile);
  });

  if (!options.skipCodeGeneration) {
    const includeFiles = new _GD.SetString();
    const eventsFunctionsExtensionCodeGenerator = new _GD.EventsFunctionsExtensionCodeGenerator(
      project
    );
    const code = eventsFunctionsExtensionCodeGenerator.generateFreeEventsFunctionCompleteCode(
      eventsFunction,
      codeNamespace,
      includeFiles,
      // For now, always generate functions for runtime (this disables
      // generation of profiling for groups (see EventsCodeGenerator))
      // as extensions generated can be used either for preview or export.
      true
    );

    // Add any include file required by the function to the list
    // of include files for this function (so that when used, the "dependencies"
    // are transitively included).
    includeFiles
      .toNewVectorString()
      .toJSArray()
      .forEach((includeFile) => {
        codeExtraInformation.addIncludeFile(includeFile);
      });

    includeFiles.delete();

    return options.eventsFunctionCodeWriter.writeFunctionCode(
      functionName,
      code
    );
  } else {
    // Skip code generation if no events function writer is provided.
    // This is the case during the "first pass", where all events functions extensions
    // are loaded as extensions but not code generated, as events in functions could
    // themselves be using functions that are not yet available in extensions.
    return Promise.resolve();
  }
};

function generateBehavior(
  project,
  extension,
  eventsFunctionsExtension,
  eventsBasedBehavior,
  options,
  codeGenerationContext
) {
  const behaviorMetadata = declareBehaviorMetadata(
    extension,
    eventsBasedBehavior
  );

  const eventsFunctionsContainer = eventsBasedBehavior.getEventsFunctions();
  const codeNamespace = getBehaviorFunctionCodeNamespace(
    eventsBasedBehavior,
    codeGenerationContext.codeNamespacePrefix
  );
  const includeFile = options.eventsFunctionCodeWriter.getIncludeFileFor(
    codeNamespace
  );

  behaviorMetadata.setIncludeFile(includeFile);

  // Always include the extension include files when using a behavior.
  codeGenerationContext.extensionIncludeFiles.forEach((includeFile) => {
    behaviorMetadata.addIncludeFile(includeFile);
  });

  return Promise.resolve().then(() => {
    const behaviorMethodMangledNames = new _GD.MapStringString();

    // Declare the instructions/expressions for properties
    declareBehaviorPropertiesInstructionAndExpressions(
      behaviorMetadata,
      eventsBasedBehavior
    );

    // Declare all the behavior functions
    mapFor(0, eventsFunctionsContainer.getEventsFunctionsCount(), (i) => {
      const eventsFunction = eventsFunctionsContainer.getEventsFunctionAt(i);

      const eventsFunctionMangledName = mangleName(eventsFunction.getName());
      behaviorMethodMangledNames.set(
        eventsFunction.getName(),
        eventsFunctionMangledName
      );

      const instructionOrExpression = declareBehaviorInstructionOrExpressionMetadata(
        behaviorMetadata,
        eventsBasedBehavior,
        eventsFunction
      );
      declareEventsFunctionParameters(eventsFunction, instructionOrExpression);

      // Hide "lifecycle" methods as they are called automatically by
      // the game engine.
      if (isBehaviorLifecycleEventsFunction(eventsFunction.getName())) {
        instructionOrExpression.setHidden();
      }

      const codeExtraInformation = instructionOrExpression.getCodeExtraInformation();
      codeExtraInformation
        .setIncludeFile(includeFile)
        .setFunctionName(eventsFunctionMangledName);
    });

    // Generate code for the behavior and its methods
    if (!options.skipCodeGeneration) {
      const includeFiles = new _GD.SetString();
      const behaviorCodeGenerator = new _GD.BehaviorCodeGenerator(project);
      const code = behaviorCodeGenerator.generateRuntimeBehaviorCompleteCode(
        eventsFunctionsExtension.getName(),
        eventsBasedBehavior,
        codeNamespace,
        behaviorMethodMangledNames,
        includeFiles,

        // For now, always generate functions for runtime (this disables
        // generation of profiling for groups (see EventsCodeGenerator))
        // as extensions generated can be used either for preview or export.
        true
      );
      behaviorCodeGenerator.delete();
      behaviorMethodMangledNames.delete();

      // Add any include file required by the functions to the list
      // of include files for this behavior (so that when used, the "dependencies"
      // are transitively included).
      includeFiles
        .toNewVectorString()
        .toJSArray()
        .forEach((includeFile) => {
          behaviorMetadata.addIncludeFile(includeFile);
        });

      includeFiles.delete();

      return options.eventsFunctionCodeWriter.writeBehaviorCode(
        codeNamespace,
        code
      );
    } else {
      // Skip code generation
      behaviorMethodMangledNames.delete();
      return Promise.resolve();
    }
  });
}

/**
 * Unload all extensions providing events functions of a project
 */
const unloadProjectEventsFunctionsExtensions = (project) => {
  return Promise.all(
    mapFor(0, project.getEventsFunctionsExtensionsCount(), (i) => {
      _GD.JsPlatform.get().removeExtension(
        project.getEventsFunctionsExtensionAt(i).getName()
      );
    })
  );
};
module.exports.unloadProjectEventsFunctionsExtensions = unloadProjectEventsFunctionsExtensions;

/**
 * Given metadata about an instruction or an expression, tells if this was created
 * from an event function.
 */
const isAnEventFunctionMetadata = (instructionOrExpression) => {
  const parametersCount = instructionOrExpression.getParametersCount();
  if (parametersCount <= 0) return false;

  return (
    instructionOrExpression.getParameter(parametersCount - 1).getType() ===
    "eventsFunctionContext"
  );
};
module.exports.isAnEventFunctionMetadata = isAnEventFunctionMetadata;

/**
 * Get back the name a function from its type.
 * See also getFreeEventsFunctionType for the reverse operation.
 */
const getFunctionNameFromType = (type) => {
  const parts = type.split("::");
  if (!parts.length)
    return {
      name: "",
      behaviorName: "",
      extensionName: "",
    };

  return {
    name: parts[parts.length - 1],
    behaviorName: parts.length > 2 ? parts[1] : undefined,
    extensionName: parts[0],
  };
};
module.exports.getFunctionNameFromType = getFunctionNameFromType;

/**
 * Get the type of a Events Function.
 * See also getFunctionNameFromType for the reverse operation.
 */
const getFreeEventsFunctionType = (extensionName, eventsFunction) => {
  return extensionName + "::" + eventsFunction.getName();
};
module.exports.getFreeEventsFunctionType = getFreeEventsFunctionType;

/**
 * Return the index of the first parameter to be shown to the user:
 * * 0 for a behavior "method",
 * * 1 for a free function (as the first parameter is by convention the runtimeScene).
 */
const getParametersIndexOffset = (isEventsBasedBehaviorMethod) => {
  return isEventsBasedBehaviorMethod
    ? 0 /*In the case of a behavior events function, the first two parameters are by convention the "Object" and "Behavior" */
    : 1; /*In the case of a free events function (i.e: not tied to a behavior), the first parameter is by convention the current scene and is not shown.*/
};
module.exports.getParametersIndexOffset = getParametersIndexOffset;
