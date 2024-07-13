/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Devs } from "./devs.ts";
import {
  addPreSendListener,
  removePreSendListener,
  SendListener,
} from "@api/MessageEvents";
import definePlugin from "@utils/types";

import { dictionary } from "./dictionary.ts";

const regex = () => {
  const keywords = Object.keys(dictionary).map((k) =>
    k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  if (!keywords.length) return null;
  return new RegExp(
    `(^|(?<=[^A-Z0-9]+))(${keywords.join("|")})((?=[^A-Z0-9]+)|$)`,
    "gi"
  );
};

const presendObject: SendListener = (_, msg) => {
  if (!msg.content.includes("```") && /\w/.test(msg.content.charAt(0))) {
    const re = regex();
    if (re !== null) {
      msg.content = msg.content.replace(re, (match) => {
        return dictionary[match.toLowerCase()] || match;
      });
    }

    if (/[A-Z0-9]/i.test(msg.content.charAt(msg.content.length - 1))) {
      if (!msg.content.startsWith("http", msg.content.lastIndexOf(" ") + 1))
        msg.content += ".";
    }

    // Ensure sentences are capitalized after punctuation
    msg.content = msg.content.replace(/([.!?])\s*(\w)/g, (match) =>
      match.toUpperCase()
    );

    // Ensure the first character of the entire message is capitalized
    if (!msg.content.startsWith("http")) {
      msg.content = msg.content.charAt(0).toUpperCase() + msg.content.slice(1);
    }
  }
};

export default definePlugin({
  name: "Grammar Nazi",
  description: "Automatic punctuation, capitalization, and word replacement.",
  authors: [Devs.unstream],
  dependencies: ["MessageEventsAPI"],
  start() {
    addPreSendListener(presendObject);
  },
  stop() {
    removePreSendListener(presendObject);
  },
});
