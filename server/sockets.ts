import express = require("express");
import provideSessionToSocketIo = require("express-socket.io-session");
import redis = require("socket.io-redis");

import { CombatStats } from "../common/CombatStats";
import { PlayerViewSettings } from "../common/PlayerViewSettings";
import { getDefaultSettings } from "../common/Settings";
import { PlayerViewManager } from "./playerviewmanager";

interface SocketWithSessionData {
  handshake: {
    session: Express.Session;
  };
}

export default function(
  io: SocketIO.Server,
  session: express.RequestHandler,
  playerViews: PlayerViewManager
) {
  if (process.env.REDIS_URL) {
    io.adapter(redis(process.env.REDIS_URL));
  }

  io.use(provideSessionToSocketIo(session));

  io.on("connection", function(
    socket: SocketIO.Socket & SocketWithSessionData
  ) {
    function joinEncounter(id: string) {
      socket.handshake.session.encounterId = id;
      socket.join(id);
    }

    socket.on("update encounter", function(id: string, updatedEncounter: {}) {
      joinEncounter(id);
      playerViews.UpdateEncounter(id, updatedEncounter);

      socket.broadcast
        .to(id)
        .volatile.emit("encounter updated", updatedEncounter);
    });

    socket.on(
      "update settings",
      (id: string, updatedSettings: PlayerViewSettings) => {
        if (!socket.handshake.session.hasEpicInitiative) {
          resetEpicInitiativeSettings(updatedSettings);
        }

        joinEncounter(id);
        playerViews.UpdateSettings(id, updatedSettings);
        socket.broadcast
          .to(id)
          .volatile.emit("settings updated", updatedSettings);
      }
    );

    socket.on("join encounter", function(id: string) {
      joinEncounter(id);
    });

    socket.on("suggest damage", function(
      id: string,
      suggestedCombatantIds: string[],
      suggestedDamage: number,
      suggester: string
    ) {
      joinEncounter(id);
      socket.broadcast
        .to(id)
        .emit(
          "suggest damage",
          suggestedCombatantIds,
          suggestedDamage,
          suggester
        );
    });

    socket.on("suggest tag", function(
      id: string,
      suggestedCombatantIds: string[],
      suggestedTag: any,
      suggester: string
    ) {
      joinEncounter(id);
      socket.broadcast
        .to(id)
        .emit("suggest tag", suggestedCombatantIds, suggestedTag, suggester);
    });

    socket.on("combat stats", function(id: string, combatStats: CombatStats) {
      joinEncounter(id);
      socket.broadcast.to(id).emit("combat stats", combatStats);
    });

    socket.on("disconnect", function() {
      const encounterId = socket.handshake.session.encounterId;
      io.in(encounterId).clients((error, clients) => {
        if (clients.length == 0) {
          playerViews.Destroy(encounterId);
        }
      });
    });
  });
}

const emptyCustomStyles = getDefaultSettings().PlayerView.CustomStyles;

function resetEpicInitiativeSettings(settings: PlayerViewSettings) {
  settings.CustomCSS = "";
  settings.CustomStyles = emptyCustomStyles;
  settings.DisplayPortraits = false;
  settings.SplashPortraits = false;
  settings.AllowTagSuggestions = false;
}
