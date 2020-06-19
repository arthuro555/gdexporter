/**
 * @memberof gdjs.evtTools
 * @class facebookInstantGames
 * @static
 * @private
 */
gdjs.evtTools.facebookInstantGames = {
  _preloadedInterstitial: null,
  _preloadedInterstitialLoading: false,
  _preloadedInterstitialLoaded: false,
  _preloadedRewardedVideo: null,
  _preloadedRewardedVideoLoading: false,
  _preloadedRewardedVideoLoaded: false
};

gdjs.evtTools.facebookInstantGames.areAdsSupported = function() {
  if (typeof FBInstant === "undefined") return false;

  var supportedAPIs = FBInstant.getSupportedAPIs();
  return (
    supportedAPIs.indexOf("getInterstitialAdAsync") !== -1 &&
    supportedAPIs.indexOf("getRewardedVideoAsync") !== -1
  );
};

gdjs.evtTools.facebookInstantGames.getPlayerId = function() {
  if (typeof FBInstant === "undefined") return "";

  return FBInstant.player.getID() || "";
};

gdjs.evtTools.facebookInstantGames.getPlayerName = function() {
  if (typeof FBInstant === "undefined") return "";

  return FBInstant.player.getName() || "";
};

gdjs.evtTools.facebookInstantGames.loadPlayerData = function(
  key,
  successVariable,
  errorVariable
) {
  if (typeof FBInstant === "undefined") return;
  errorVariable.setString("");
  successVariable.setString("");

  FBInstant.player
    .getDataAsync([key])
    .then(function(data) {
      gdjs.evtTools.network.jsonToVariableStructure(data[key], successVariable);
    })
    .catch(function(error) {
      errorVariable.setString(error.message || "Unknown error");
    });
};

gdjs.evtTools.facebookInstantGames.setPlayerData = function(
  key,
  variable,
  successVariable,
  errorVariable
) {
  if (typeof FBInstant === "undefined") return;
  errorVariable.setString("");
  successVariable.setString("");

  var data = {};
  data[key] = gdjs.evtTools.network.variableStructureToJSON(variable);

  FBInstant.player
    .setDataAsync(data)
    .then(function() {
      successVariable.setString("Player data saved");
    })
    .catch(function(error) {
      errorVariable.setString(error.message || "Unknown error");
    });
};

gdjs.evtTools.facebookInstantGames.setPlayerScore = function(
  leaderboardName,
  score,
  extraDataVariable,
  successVariable,
  errorVariable
) {
  if (typeof FBInstant === "undefined") return;
  errorVariable.setString("");
  successVariable.setString("");

  var data = gdjs.evtTools.network.variableStructureToJSON(extraDataVariable);

  FBInstant.getLeaderboardAsync(leaderboardName)
    .then(function(leaderboard) {
      return leaderboard.setScoreAsync(score, data);
    })
    .then(function() {
      successVariable.setString("Player score saved");
    })
    .catch(function(error) {
      errorVariable.setString(error.message || "Unknown error");
    });
};

gdjs.evtTools.facebookInstantGames.getPlayerEntry = function(
  leaderboardName,
  rankVariable,
  scoreVariable,
  extraDataVariable,
  errorVariable
) {
  if (typeof FBInstant === "undefined") return;
  errorVariable.setString("");
  extraDataVariable.setString("");

  FBInstant.getLeaderboardAsync(leaderboardName)
    .then(function(leaderboard) {
      return leaderboard.getPlayerEntryAsync();
    })
    .then(function(entry) {
      rankVariable.setNumber(entry.getRank() === null ? -1 : entry.getRank());
      scoreVariable.setNumber(
        entry.getScore() === null ? -1 : entry.getScore()
      );
      gdjs.evtTools.network.jsonToVariableStructure(
        entry.getExtraData(),
        extraDataVariable
      );
    })
    .catch(function(error) {
      errorVariable.setString(error.message || "Unknown error");
    });
};

gdjs.evtTools.facebookInstantGames.loadInterstitialAd = function(
  adPlacementId,
  errorVariable
) {
  if (typeof FBInstant === "undefined") return;

  if (
    gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoading ||
    gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoaded
  )
    return;

  gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoading = true;
  FBInstant.getInterstitialAdAsync(adPlacementId)
    .then(function(interstitial) {
      gdjs.evtTools.facebookInstantGames._preloadedInterstitial = interstitial;
      return interstitial.loadAsync();
    })
    .then(function() {
      gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoading = false;
      gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoaded = true;
      console.info("Facebook Instant Games interstitial preloaded.");
    })
    .catch(function(err) {
      gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoading = false;
      gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoaded = false;
      console.error("Interstitial failed to preload: " + err.message);
      errorVariable.setString(error.message || "Unknown error");
    });
};

gdjs.evtTools.facebookInstantGames.showInterstitialAd = function(
  errorVariable
) {
  if (typeof FBInstant === "undefined") return;

  if (!gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoaded) return;

  gdjs.evtTools.facebookInstantGames._preloadedInterstitial
    .showAsync()
    .then(function() {
      console.info("Facebook Instant Games interstitial shown.");
    })
    .catch(function(err) {
      console.error("Interstitial failed to show: " + err.message);
      errorVariable.setString(error.message || "Unknown error");
    })
    .then(function() {
      gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoaded = false;
    });
};

gdjs.evtTools.facebookInstantGames.isInterstitialAdReady = function() {
  return gdjs.evtTools.facebookInstantGames._preloadedInterstitialLoaded;
};

gdjs.evtTools.facebookInstantGames.loadRewardedVideo = function(
  adPlacementId,
  errorVariable
) {
  if (typeof FBInstant === "undefined") return;

  if (
    gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoading ||
    gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoaded
  )
    return;

  gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoading = true;
  FBInstant.getRewardedVideoAsync(adPlacementId)
    .then(function(rewardedVideo) {
      gdjs.evtTools.facebookInstantGames._preloadedRewardedVideo = rewardedVideo;
      return rewardedVideo.loadAsync();
    })
    .then(function() {
      gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoading = false;
      gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoaded = true;
      console.info("Facebook Instant Games rewarded video preloaded.");
    })
    .catch(function(err) {
      gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoading = false;
      gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoaded = false;
      console.error("Rewarded video failed to preload: " + err.message);
      errorVariable.setString(error.message || "Unknown error");
    });
};

gdjs.evtTools.facebookInstantGames.showRewardedVideo = function(errorVariable) {
  if (typeof FBInstant === "undefined") return;

  if (!gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoaded) return;

  gdjs.evtTools.facebookInstantGames._preloadedRewardedVideo
    .showAsync()
    .then(function() {
      console.info("Facebook Instant Games rewarded video shown.");
    })
    .catch(function(err) {
      console.error("Rewarded video failed to show: " + err.message);
      errorVariable.setString(error.message || "Unknown error");
    })
    .then(function() {
      gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoaded = false;
    });
};

gdjs.evtTools.facebookInstantGames.isRewardedVideoReady = function() {
  return gdjs.evtTools.facebookInstantGames._preloadedRewardedVideoLoaded;
};

if (typeof FBInstant === "undefined" && typeof window !== "undefined") {
  console.log("Creating a mocked version of Facebook Instant Games.");

  /**
   * A mocked Leaderboard, part of the mock of FBInstant.
   * @class MockedLeaderboard
   */
  function MockedLeaderboard() {
    this._playerScore = null;
    this._playerRank = null;
    this._playerExtraData = null;
  }
  MockedLeaderboard.prototype.setScoreAsync = function(score, extraData) {
    var that = this;
    return new Promise(function(resolve) {
      that._playerScore = score;
      that._playerRank = 1;
      that._playerExtraData = extraData;
      resolve();
    });
  };
  MockedLeaderboard.prototype.getPlayerEntryAsync = function() {
    var that = this;
    return new Promise(function(resolve) {
      resolve({
        getScore: function() {
          return that._playerScore;
        },
        getRank: function() {
          return that._playerRank;
        },
        getExtraData: function() {
          return that._playerExtraData;
        }
      });
    });
  };

  /**
   * A mocked RewardedVideo, part of the mock of FBInstant.
   * @class RewardedVideo
   */
  function MockedRewardedVideo() {
    this._isLoaded = false;
  }
  MockedRewardedVideo.prototype.loadAsync = function() {
    this._isLoaded = true;
    return Promise.resolve();
  };
  MockedRewardedVideo.prototype.showAsync = function() {
    if (this._isLoaded) {
      console.info(
        "In a real Instant Game, a video reward should have been shown to the user."
      );
      return Promise.resolve();
    }
    return Promise.reject(new Error("Rewarded video is not loaded."));
  };

  /**
   * A mocked MockedInterstitial, part of the mock of FBInstant.
   * @class MockedInterstitial
   */
  function MockedInterstitial() {
    this._isLoaded = false;
  }
  MockedInterstitial.prototype.loadAsync = function() {
    this._isLoaded = true;
    return Promise.resolve();
  };
  MockedInterstitial.prototype.showAsync = function() {
    if (this._isLoaded) {
      console.info(
        "In a real Instant Game, an interstitial should have been shown to the user."
      );
      return Promise.resolve();
    }
    return Promise.reject(new Error("Interstitial is not loaded."));
  };

  var supportedAPIs = [];
  var FBInstantMock = {
    _mockedPlayerData: {},
    _mockedLeaderboards: {},
    player: {
      getName: function() {
        return "Fake player name";
      },
      getID: function() {
        return "12345678";
      },
      getDataAsync: function(key) {
        return new Promise(function(resolve) {
          resolve(FBInstantMock._mockedPlayerData);
        });
      },
      setDataAsync: function(data) {
        return new Promise(function(resolve) {
          FBInstantMock._mockedPlayerData = data;
          resolve();
        });
      }
    },
    getLeaderboardAsync: function(leaderboardName) {
      return new Promise(function(resolve) {
        FBInstantMock._mockedLeaderboards[leaderboardName] =
          FBInstantMock._mockedLeaderboards[leaderboardName] ||
          new MockedLeaderboard();
        resolve(FBInstantMock._mockedLeaderboards[leaderboardName]);
      });
    },
    getInterstitialAdAsync: function() {
      return Promise.resolve(new MockedInterstitial());
    },
    getRewardedVideoAsync: function() {
      return Promise.resolve(new MockedRewardedVideo());
    },
    getSupportedAPIs: function() {
      return supportedAPIs;
    }
  };

  // Retrieve the name of the supported APIs in our mock.
  for (var property in FBInstantMock) {
    if (typeof FBInstantMock[property] == "object") {
      for (var subProperty in FBInstantMock[property]) {
        if (typeof FBInstantMock[property][subProperty] == "function") {
          supportedAPIs.push(property + "." + subProperty);
        }
      }
    } else if (typeof FBInstantMock[property] == "function") {
      supportedAPIs.push(property);
    }
  }

  window.FBInstant = FBInstantMock;
}
