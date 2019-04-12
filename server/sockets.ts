import express = require("express");
import provideSessionToSocketIo = require("express-socket.io-session");

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
  io.use(provideSessionToSocketIo(session));

  io.on("connection", function(
    socket: SocketIO.Socket & SocketWithSessionData
  ) {
    let encounterId;

    function joinEncounter(id: string) {
      encounterId = id;
      socket.join(id);
      playerViews.EnsureInitialized(id);
    }

    socket.on("update encounter", function(id: string, updatedEncounter: {}) {
      joinEncounter(id);
      playerViews.UpdateEncounter(id, updatedEncounter);

      socket.broadcast
        .to(encounterId)
        .emit("encounter updated", updatedEncounter);
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
          .to(encounterId)
          .emit("settings updated", updatedSettings);
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
        .to(encounterId)
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
        .to(encounterId)
        .emit("suggest tag", suggestedCombatantIds, suggestedTag, suggester);
    });

    socket.on("disconnect", function() {
      io.in(encounterId).clients((error, clients) => {
        if (clients.length == 0) {
          playerViews.Destroy(encounterId);
        }
      });
    });

    socket.on("heartbeat", function(id: string) {
      socket.broadcast.to(id).emit("heartbeat");
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
