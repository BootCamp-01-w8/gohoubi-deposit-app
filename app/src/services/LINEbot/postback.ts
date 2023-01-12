import { Router } from "express";
import * as line from "@line/bot-sdk";

import { PostbackEvent } from '@line/bot-sdk';
import { suggestUsage } from "@src/services/LINEbot/suggestUsage";

const WebhookRouter = Router();

const config: any = {
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const client = new line.Client(config);

export const postback = (event: PostbackEvent) => {

    if (event.postback.data === "useDeposit") {
        return suggestUsage(event);
    } else if (event.postback.data === "shopping") {
        // 楽天
        console.log("楽天");
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: "楽天",
        });
    } else if (event.postback.data === "eat") {
        // 食べログ
        console.log("食べログ");
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: "食べログ",
        });
    } else if (event.postback.data === "travel") {
        // じゃらん
        console.log("じゃらん");
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: "じゃらん",
        });
    } else if (event.postback.data === "transfer") {
        // 振込
        console.log("振込");
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: "振込",
        });
    }
}
