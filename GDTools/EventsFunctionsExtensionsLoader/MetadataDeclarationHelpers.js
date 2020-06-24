const { mapVector } = require('../MapFor');

// This file contains the logic to declare extension metadata from
// events functions or events based behaviors.
// These are basically adapters from EventsFunctionsExtension, and children, to a
// real extension declaration (like in `JsExtension.js` or `Extension.cpp` files).

/**
 * Declare an extension from an events based extension.
 */
const declareExtension = (
  extension,
  eventsFunctionsExtension                            
) => {
  extension.setExtensionInformation(
    eventsFunctionsExtension.getName(),
    eventsFunctionsExtension.getFullName() ||
      eventsFunctionsExtension.getName(),
    eventsFunctionsExtension.getDescription(),
    '',
    ''
  );
};
module.exports.declareExtension = declareExtension;

/**
 * Declare the behavior for the given
 * events based behavior.
 */
const declareBehaviorMetadata = (
  extension,
  eventsBasedBehavior                       
)                     => {
  const generatedBehavior = new gd.BehaviorJsImplementation();

  // The functions below are keeping a reference to eventsBasedBehavior.
  // This should be safe as if eventsBasedBehavior is deleted (i.e: the behavior
  // is removed from its extension), then extension will be re-generated.

  // Declare the properties of the behavior:

  // $FlowExpectedError - we're creating a behavior
  generatedBehavior.updateProperty = function(
    behaviorContent,
    propertyName,
    newValue
  ) {
    let propertyFound = false;
    mapVector(eventsBasedBehavior.getPropertyDescriptors(), property => {
      if (property.getName() === propertyName) {
        propertyFound = true;
        const element = behaviorContent.addChild(propertyName);
        const propertyType         = property.getType();

        if (propertyType === 'String' || propertyType === 'Choice') {
          element.setStringValue(newValue);
        } else if (propertyType === 'Number') {
          element.setDoubleValue(parseFloat(newValue));
        } else if (propertyType === 'Boolean') {
          element.setBoolValue(newValue === '1');
        }
      }
    });

    return propertyFound;
  };

  // $FlowExpectedError - we're creating a behavior
  generatedBehavior.getProperties = function(behaviorContent) {
    var behaviorProperties = new gd.MapStringPropertyDescriptor();
    mapVector(eventsBasedBehavior.getPropertyDescriptors(), property => {
      const newProperty = property.toPropertyDescriptor();
      const propertyType         = newProperty.getType();

      if (behaviorContent.hasChild(property.getName())) {
        if (propertyType === 'String' || propertyType === 'Choice') {
          newProperty.setValue(
            behaviorContent.getChild(property.getName()).getStringValue()
          );
        } else if (propertyType === 'Number') {
          newProperty.setValue(
            '' + behaviorContent.getChild(property.getName()).getDoubleValue()
          );
        } else if (propertyType === 'Boolean') {
          newProperty.setValue(
            behaviorContent.getChild(property.getName()).getBoolValue()
              ? 'true'
              : 'false'
          );
        }
      } else {
        // No value was serialized for this property. `newProperty`
        // will have the default value coming from `property`.
      }

      behaviorProperties.set(property.getName(), newProperty);
    });

    return behaviorProperties;
  };

  // $FlowExpectedError - we're creating a behavior
  generatedBehavior.initializeContent = function(behaviorContent) {
    mapVector(eventsBasedBehavior.getPropertyDescriptors(), property => {
      const element = behaviorContent.addChild(property.getName());
      const propertyType         = property.getType();

      if (propertyType === 'String' || propertyType === 'Choice') {
        element.setStringValue(property.getValue());
      } else if (propertyType === 'Number') {
        element.setDoubleValue(parseFloat(property.getValue()) || 0);
      } else if (propertyType === 'Boolean') {
        element.setBoolValue(property.getValue() === 'true');
      }
    });
  };

  return extension
    .addBehavior(
      eventsBasedBehavior.getName(),
      eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
      eventsBasedBehavior.getName(), // Default name is the name
      eventsBasedBehavior.getDescription(),
      '',
      'res/function24.png',
      eventsBasedBehavior.getName(), // Class name is the name, actually unused
      generatedBehavior,
      new gd.BehaviorsSharedData()
    )
    .setObjectType(eventsBasedBehavior.getObjectType());
};
module.exports.declareBehaviorMetadata = declareBehaviorMetadata;

/**
 * Check if the name of the function is the name of a lifecycle function (for events-based behaviors),
 * that will be called automatically by the game engine.
 */
const isBehaviorLifecycleEventsFunction = (functionName        ) => {
  return (
    [
      'onCreated',
      'onActivate',
      'onDeActivate',
      'doStepPreEvents',
      'doStepPostEvents',
      'onDestroy',
      // Compatibility with GD <= 5.0 beta 75
      'onOwnerRemovedFromScene',
      // end of compatibility code
    ].indexOf(functionName) !== -1
  );
};
module.exports.isBehaviorLifecycleEventsFunction = isBehaviorLifecycleEventsFunction;

/**
 * Check if the name of the function is the name of a lifecycle function (for events-based extensions),
 * that will be called automatically by the game engine.
 */
const isExtensionLifecycleEventsFunction = (functionName        ) => {
  return gd.EventsFunctionsExtension.isExtensionLifecycleEventsFunction(
    functionName
  );
};
module.exports.isExtensionLifecycleEventsFunction = isExtensionLifecycleEventsFunction;

/**
 * Declare the instruction (action/condition) or expression for the given
 * (free) events function.
 */
const declareInstructionOrExpressionMetadata = (
  extension                     ,
  eventsFunctionsExtension                            ,
  eventsFunction                  
)                                               => {
  const functionType = eventsFunction.getFunctionType();
  if (functionType === gd.EventsFunction.Expression) {
    return extension.addExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      'res/function.png'
    );
  } else if (functionType === gd.EventsFunction.StringExpression) {
    return extension.addStrExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      'res/function.png'
    );
  } else if (functionType === gd.EventsFunction.Condition) {
    return extension.addCondition(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      'res/function.png',
      'res/function24.png'
    );
  } else {
    return extension.addAction(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsFunctionsExtension.getFullName() ||
        eventsFunctionsExtension.getName(),
      'res/function.png',
      'res/function24.png'
    );
  }
};
module.exports.declareInstructionOrExpressionMetadata = declareInstructionOrExpressionMetadata;

/**
 * Declare the instruction (action/condition) or expression for the given
 * behavior events function.
 */
const declareBehaviorInstructionOrExpressionMetadata = (
  behaviorMetadata                    ,
  eventsBasedBehavior                       ,
  eventsFunction                  
)                                               => {
  const functionType = eventsFunction.getFunctionType();
  if (functionType === gd.EventsFunction.Expression) {
    return behaviorMetadata.addExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
      'res/function.png'
    );
  } else if (functionType === gd.EventsFunction.StringExpression) {
    return behaviorMetadata.addStrExpression(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
      'res/function.png'
    );
  } else if (functionType === gd.EventsFunction.Condition) {
    // Use the new "scoped" way to declare an instruction, because
    // we want to prevent any conflict between free functions and
    // behaviors (that can totally have functions with the same name).
    return behaviorMetadata.addScopedCondition(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
      'res/function.png',
      'res/function24.png'
    );
  } else {
    // Use the new "scoped" way to declare an instruction, because
    // we want to prevent any conflict between free functions and
    // behaviors (that can totally have functions with the same name).
    return behaviorMetadata.addScopedAction(
      eventsFunction.getName(),
      eventsFunction.getFullName() || eventsFunction.getName(),
      eventsFunction.getDescription() || eventsFunction.getFullName(),
      eventsFunction.getSentence(),
      eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
      'res/function.png',
      'res/function24.png'
    );
  }
};
module.exports.declareBehaviorInstructionOrExpressionMetadata = declareBehaviorInstructionOrExpressionMetadata;
                                        
                         
                         

/**
 * Declare the instructions (actions/conditions) and expressions for the
 * properties of the given events based behavior.
 * This is akin to what would happen by manually declaring a JS extension
 * (see `JsExtension.js` files of extensions).
 */
const declareBehaviorPropertiesInstructionAndExpressions = (
  behaviorMetadata,
  eventsBasedBehavior
)       => {
  const addObjectAndBehaviorParameters =                                       (
    instructionOrExpression   
  )    => {
    // By convention, first parameter is always the object:
    instructionOrExpression.addParameter(
      'object',
      'Object',
      '', // See below for adding the extra information
      false
    );

    // Manually add the "extra info" without relying on addParameter
    // as this method is prefixing the value passed with the extension namespace (this
    // was done to ease extension declarations when dealing with object).
    instructionOrExpression
      .getParameter(instructionOrExpression.getParametersCount() - 1)
      .setExtraInfo(eventsBasedBehavior.getObjectType());

    // By convention, second parameter is always the behavior:
    instructionOrExpression.addParameter(
      'behavior',
      'Behavior',
      eventsBasedBehavior.getName(),
      false
    );

    // All property actions/conditions/expressions are private, meaning
    // they can only be used from the behavior events.
    instructionOrExpression.setPrivate();

    return instructionOrExpression;
  };

  mapVector(eventsBasedBehavior.getPropertyDescriptors(), property => {
    const propertyType = property.getType();
    const propertyName = property.getName();
    const getterName = gd.BehaviorCodeGenerator.getBehaviorPropertyGetterName(
      propertyName
    );
    const setterName = gd.BehaviorCodeGenerator.getBehaviorPropertySetterName(
      propertyName
    );
    const propertyLabel =
      property.getLabel() || `${propertyName} property`;

    if (propertyType === 'String' || propertyType === 'Choice') {
      addObjectAndBehaviorParameters(
        behaviorMetadata.addStrExpression(
          gd.EventsBasedBehavior.getPropertyExpressionName(propertyName),
          propertyLabel,
          propertyLabel,
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          'res/function.png'
        )
      )
        .getCodeExtraInformation()
        .setFunctionName(getterName);

      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedCondition(
          gd.EventsBasedBehavior.getPropertyConditionName(propertyName),
          propertyLabel,
          `Compare the content of ${propertyLabel}`,
          `the property ${propertyName}`,
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          'res/function32.png',
          'res/function.png'
        )
      )
        .useStandardRelationalOperatorParameters('string')
        .getCodeExtraInformation()
        .setFunctionName(getterName);

      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedAction(
          gd.EventsBasedBehavior.getPropertyActionName(propertyName),
          propertyLabel,
          `Change the content of ${propertyLabel}`,
          `the property ${propertyName}`,
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          'res/function32.png',
          'res/function.png'
        )
      )
        .useStandardOperatorParameters('string')
        .getCodeExtraInformation()
        .setFunctionName(setterName)
        .setManipulatedType('string')
        .setGetter(getterName);
    } else if (propertyType === 'Number') {
      addObjectAndBehaviorParameters(
        behaviorMetadata.addExpression(
          gd.EventsBasedBehavior.getPropertyExpressionName(propertyName),
          propertyLabel,
          propertyLabel,
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          'res/function.png'
        )
      )
        .getCodeExtraInformation()
        .setFunctionName(getterName);

      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedCondition(
          gd.EventsBasedBehavior.getPropertyConditionName(propertyName),
          propertyLabel,
          `Compare the value of ${propertyLabel}`,
          `the property ${propertyName}`,
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          'res/function32.png',
          'res/function.png'
        )
      )
        .useStandardRelationalOperatorParameters('number')
        .getCodeExtraInformation()
        .setFunctionName(getterName);

      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedAction(
          gd.EventsBasedBehavior.getPropertyActionName(propertyName),
          propertyLabel,
          `Change the value of ${propertyLabel}`,
          `the property ${propertyName}`,
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          'res/function32.png',
          'res/function.png'
        )
      )
        .useStandardOperatorParameters('number')
        .getCodeExtraInformation()
        .setFunctionName(setterName)
        .setGetter(getterName);
    } else if (propertyType === 'Boolean') {
      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedCondition(
          gd.EventsBasedBehavior.getPropertyConditionName(propertyName),
          propertyLabel,
          `Check the value of ${propertyLabel}`,
          `Property ${propertyName} of _PARAM0_ is true`,
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          'res/function32.png',
          'res/function.png'
        )
      )
        .getCodeExtraInformation()
        .setFunctionName(getterName);

      addObjectAndBehaviorParameters(
        behaviorMetadata.addScopedAction(
          gd.EventsBasedBehavior.getPropertyActionName(propertyName),
          propertyLabel,
          `Update the value of ${propertyLabel}`,
          `Set property ${propertyName} of _PARAM0_ to _PARAM2_`,
          eventsBasedBehavior.getFullName() || eventsBasedBehavior.getName(),
          'res/function32.png',
          'res/function.png'
        )
      )
        .addParameter('yesorno', `New value to set`, '', false)
        .getCodeExtraInformation()
        .setFunctionName(setterName);
    }
  });
};

module.exports.declareBehaviorPropertiesInstructionAndExpressions = declareBehaviorPropertiesInstructionAndExpressions;

/**
 * Add to the instruction (action/condition) or expression the parameters
 * expected by the events function.
 */
const declareEventsFunctionParameters = (
  eventsFunction                  ,
  instructionOrExpression                                              
) => {
  mapVector(
    eventsFunction.getParameters(),
    (parameter                     ) => {
      if (!parameter.isCodeOnly()) {
        instructionOrExpression.addParameter(
          parameter.getType(),
          parameter.getDescription(),
          '', // See below for adding the extra information
          parameter.isOptional()
        );
        instructionOrExpression.setParameterLongDescription(
          parameter.getLongDescription()
        );
      } else {
        instructionOrExpression.addCodeOnlyParameter(
          parameter.getType(),
          '' // See below for adding the extra information
        );
      }
      // Manually add the "extra info" without relying on addParameter (or addCodeOnlyParameter)
      // as these methods are prefixing the value passed with the extension namespace (this
      // was done to ease extension declarations when dealing with object).
      instructionOrExpression
        .getParameter(instructionOrExpression.getParametersCount() - 1)
        .setExtraInfo(parameter.getExtraInfo());
    }
  );

  // By convention, latest parameter is always the eventsFunctionContext of the calling function
  // (if any).
  instructionOrExpression.addCodeOnlyParameter('eventsFunctionContext', '');
};
module.exports.declareEventsFunctionParameters = declareEventsFunctionParameters;
