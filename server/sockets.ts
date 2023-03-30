import express = require("express");
import provideSessionToSocketIo = require("express-socket.io-session");
import redis = require("redis");

import { createAdapter } from "@socket.io/redis-adapter";
import * as SocketIO from "socket.io";

import { CombatStats } from "../common/CombatStats";
import { PlayerViewSettings } from "../common/PlayerViewSettings";
import { getDefaultSettings } from "../common/Settings";
import { PlayerViewManager } from "./playerviewmanager";
import { EncounterState } from "../common/EncounterState";
import { PlayerViewCombatantState } from "../common/PlayerViewCombatantState";
import { ValidateEncounterId } from "../common/ValidateEncounterId";

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
    const pubClient = redis.createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    const adapter: any = createAdapter(pubClient, subClient);
    io.adapter(adapter);
  }

  io.use(provideSessionToSocketIo(session));

  io.on("connection", function(
    socket: SocketIO.Socket & SocketWithSessionData
  ) {
    function joinEncounter(id: string) {
      socket.handshake.session.encounterId = id;
      socket.join(id);
    }

    socket.on("update encounter", function(
      id: string,
      updatedEncounter: EncounterState<PlayerViewCombatantState>
    ) {
      if (!socket.handshake.session.hasEpicInitiative) {
        resetEpicInitiativeEncounterFeatures(updatedEncounter);
      }

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

    socket.on("request custom id", async function(
      id: string,
      callback: (didGrantId: boolean) => void
    ) {
      if (
        !socket.handshake.session.hasEpicInitiative ||
        !ValidateEncounterId(id)
      ) {
        return callback(false);
      }

      const idAvailable = await playerViews.IdAvailable(id);
      if (idAvailable) {
        const oldId = socket.handshake.session.encounterId;
        playerViews.Destroy(oldId);
        joinEncounter(id);
        return callback(true);
      } else {
        return callback(false);
      }
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

function resetEpicInitiativeEncounterFeatures(
  encounterState: EncounterState<PlayerViewCombatantState>
) {
  encounterState.BackgroundImageUrl = undefined;
}
