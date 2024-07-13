/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addPreSendListener, removePreSendListener, SendListener, } from "@api/MessageEvents";
import definePlugin from "@utils/types";

const dictionary = {
    "i": "I",
    "lol": "LOL",
    "cuz": "because",
    "cause": "because",
    "bc": "because",

    "doesnt": "doesn't",
    "cant": "can't",
    "wont": "won't",
    "dont": "don't",
    "ive": "I've",
    "id": "I'd",
    "im": "I'm",
    "shes": "she's",
    "hes": "he's",
    "its": "it's",
    "theres": "there's",
    "theyre": "they're",
    "youve": "you've",
    "youre": "you're",
    "couldnt": "couldn't",
    "shouldnt": "shouldn't",
    "wouldnt": "wouldn't",
    "lets": "let's",
    "thats": "that's",
    "wheres": "where's",
    "whos": "who's",
    "itll": "it'll",

    "imo": "in my opinion",
    "idk": "I don't know",
    "omg": "oh my god",
    "brb": "be right back",
    "stfu": "shut the fuck up",
    "ily": "I love you",
    "lmk": "let me know",
    "nvm": "nevermind",
    "smh": "shaking my head",
    "ty": "thank you",
    "tysm": "thank you so much",
    "wtf": "what the fuck",
    "tf": "the fuck"
};

const regex = () => {
    const keywords = Object.keys(dictionary).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!keywords.length) return null;
    return new RegExp(`(^|(?<=[^A-Z0-9]+))(${keywords.join("|")})((?=[^A-Z0-9]+)|$)`, "gi");
};

const presendObject: SendListener = async (_, msg) => {
    msg.content = textProcessing(msg.content);
};

export default definePlugin({
    name: "Grammar Nazi",
    description: "Automatic punctuation, capitalization, and word replacement.",
    authors: [
        {
            name: "Unstream",
            id: 1125315673829154837n,
        }
    ],
    dependencies: ["MessageEventsAPI"],
    start() {
        addPreSendListener(presendObject);
    },
    stop() {
        removePreSendListener(presendObject);
    },
});

function textProcessing(content: string) {
    if (!content.includes("```") && /\w/.test(content.charAt(0))) {
        const re = regex();
        if (re !== null) {
            content = content.replace(re, (match) => {
                return dictionary[match.toLowerCase()] || match;
            });
        }

        if (/[A-Z0-9]/i.test(content.charAt(content.length - 1))) {
            if (!content.startsWith("http", content.lastIndexOf(" ") + 1)) content += ".";
        }

        // Ensure sentences are capitalized after punctuation
        content = content.replace(/([.!?])\s*(\w)/g, (match) => match.toUpperCase());

        // Ensure the first character of the entire message is capitalized
        if (!content.startsWith("http")) {
            content = content.charAt(0).toUpperCase() + content.slice(1);
        }
    }
    return content;
}
