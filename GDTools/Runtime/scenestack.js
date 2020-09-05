// @ts-check

/**
 * Hold the stack of scenes (gdjs.RuntimeScene) being played.
 *
 * @memberof gdjs
 * @param {gdjs.RuntimeGame} runtimeGame The runtime game that is using the scene stack
 * @class SceneStack
 */
gdjs.SceneStack = function(runtimeGame) {
    if (!runtimeGame) {
    	throw "SceneStack must be constructed with a gdjs.RuntimeGame."
    }

    this._runtimeGame = runtimeGame;

    /** @type {gdjs.RuntimeScene[]} */
    this._stack = [];

    /** @type {boolean} */
    this._wasFirstSceneLoaded = false;
};

/**
 * Called by the RuntimeGame when the game resolution is changed.
 * Useful to notify scene and layers that resolution is changed, as they
 * might be caching it.
 */
gdjs.SceneStack.prototype.onGameResolutionResized = function() {
	for(var i = 0;i < this._stack.length; ++i) {
		this._stack[i].onGameResolutionResized();
	}
};

gdjs.SceneStack.prototype.step = function(elapsedTime) {
	if (this._stack.length === 0) return false;

	var currentScene = this._stack[this._stack.length - 1];
    if (currentScene.renderAndStep(elapsedTime)) {
    	var request = currentScene.getRequestedChange();
        //Something special was requested by the current scene.
        if (request === gdjs.RuntimeScene.STOP_GAME) {
            this._runtimeGame.getRenderer().stopGame();
            return true;
        } else if (request === gdjs.RuntimeScene.POP_SCENE) {
        	this.pop();
        } else if (request === gdjs.RuntimeScene.PUSH_SCENE) {
        	this.push(currentScene.getRequestedScene());
        } else if (request === gdjs.RuntimeScene.REPLACE_SCENE) {
            this.replace(currentScene.getRequestedScene());
        } else if (request === gdjs.RuntimeScene.CLEAR_SCENES) {
        	this.replace(currentScene.getRequestedScene(), true);
        } else {
        	console.error("Unrecognized change in scene stack.");
        	return false;
        }
    }

    return true;
};

gdjs.SceneStack.prototype.renderWithoutStep = function() {
	if (this._stack.length === 0) return false;

	var currentScene = this._stack[this._stack.length - 1];
    currentScene.render();

    return true;
};

gdjs.SceneStack.prototype.pop = function() {
	if (this._stack.length <= 1) return null;

    // Unload the current scene
    var scene = this._stack.pop();
    if (!scene) return null;

    scene.unloadScene();

    // Tell the new current scene it's being resumed
    var currentScene = this._stack[this._stack.length - 1];
    if (currentScene) {
        currentScene.onResume();
    }

	return scene;
};

gdjs.SceneStack.prototype.push = function(newSceneName, externalLayoutName) {
    // Tell the scene it's being paused
    var currentScene = this._stack[this._stack.length - 1];
    if (currentScene) {
        currentScene.onPause();
    }

    // Load the new one
    var newScene = new gdjs.RuntimeScene(this._runtimeGame);
    newScene.loadFromScene(this._runtimeGame.getSceneData(newSceneName));
    this._wasFirstSceneLoaded = true;

    // Optionally create the objects from an external layout.
    if (externalLayoutName) {
        var externalLayoutData = this._runtimeGame.getExternalLayoutData(externalLayoutName);
        if (externalLayoutData)
            newScene.createObjectsFrom(externalLayoutData.instances, 0, 0, /*trackByPersistentUuid=*/ true);
    }

    this._stack.push(newScene);
    return newScene;
};

gdjs.SceneStack.prototype.replace = function(newSceneName, clear) {
	if (!!clear) {
        // Unload all the scenes
        while (this._stack.length !== 0) {
            var scene = this._stack.pop();
            if (scene) scene.unloadScene();
        }
    } else {
        // Unload the current scene
        if (this._stack.length !== 0) {
            var scene = this._stack.pop();
            if (scene) scene.unloadScene();
        }
    }

	return this.push(newSceneName);
};

/**
 * Return the current gdjs.RuntimeScene being played, or null if none is run.
 */
gdjs.SceneStack.prototype.getCurrentScene = function() {
	if (this._stack.length === 0) return null;

	return this._stack[this._stack.length - 1];
};

/**
 * Return true if a scene was loaded, false otherwise (i.e: game not yet started).
 */
gdjs.SceneStack.prototype.wasFirstSceneLoaded = function() {
    return this._wasFirstSceneLoaded;
}
