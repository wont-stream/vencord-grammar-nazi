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

const getPresend = (dictionary) => {
  const presendObject: SendListener = (_, msg) => {
    msg.content = msg.content.trim();
    if (!msg.content.includes("```") && /\w/.test(msg.content.charAt(0))) {
      const re = new RegExp(
        `(^|(?<=[^A-Z0-9]+))(${Object.keys(dictionary)
          .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("|")})((?=[^A-Z0-9]+)|$)`,
        "gi"
      );
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
        msg.content =
          msg.content.charAt(0).toUpperCase() + msg.content.slice(1);
      }
    }
  };
  return presendObject;
};

export default definePlugin({
  name: "Grammar Nazi",
  description: "Automatic punctuation, capitalization, and word replacement.",
  authors: [Devs.unstream],
  dependencies: ["MessageEventsAPI"],
  async start() {
    let dictionary = await fetch(
      "https://wont-stream.github.io/dictionary/index.min.json"
    );
    dictionary = await dictionary.json();

    addPreSendListener(getPresend(dictionary));
  },
  stop() {
    removePreSendListener(getPresend({}));
  },
});
