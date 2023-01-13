import { Router } from "express";
import * as line from "@line/bot-sdk";
import { balancesService } from "@src/services/sunabar/sunabar-service";
import { spAccountsTransfer } from "@src/services/sunabar/spAccounts";
import { useDeposit } from "@src/services/LINEbot/use-deposit";

const WebhookRouter = Router();

const config: any = {
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

WebhookRouter.use("/webhook", line.middleware(config));
const client = new line.Client(config);

const childSpAcId = process.env.SUNABAR_CHILD_ACCOUNT_ID;
const parentSpAcId = process.env.SUNABAR_PARENT_ACCOUNT_ID;

export const textMessage = async (event: any) => {
    const message = event.message.text;
    /* 残高照会の呼び出し */
    const balancesResponse = await balancesService.get("/"); //残高照会API呼び出し
    const rootBalance = balancesResponse.data.spAccountBalances[0].odBalance; //親口座残高
    const childBalance = balancesResponse.data.spAccountBalances[1].odBalance; //子口座残高

    if (message === "残高") {
        return client.replyMessage(event.replyToken, [
            {
                type: "text",
                text: `残高は、親口座：${Number(rootBalance).toLocaleString()}円、ごほうび口座：${Number(childBalance).toLocaleString()}円だよ。`,
            },
        ]);
    } else if (message === ("疲れた" || "つらい")) {

        /* 残高30000円以上で「使う？」ルートへ */
        if (rootBalance >= 30000) {
            return useDeposit(event);
        }
        else if (message === "疲れた" && rootBalance >= 1000) {
            spAccountsTransfer(childSpAcId, parentSpAcId, 100);
            console.log("疲れた");
            return client.replyMessage(event.replyToken, [
                {
                    type: "text",
                    text: `100円をごほうび貯金したよ`,
                },
                {
                    type: "text",
                    text: "おつかれさま！ゆっくりやすんでね。",
                },
            ]);
        } else if (message === "つらい" && rootBalance >= 1000) {
            spAccountsTransfer(childSpAcId, parentSpAcId, 1000);
            return client.replyMessage(event.replyToken, [
                {
                    type: "text",
                    text: `1000円をごほうび貯金したよ`,
                },
                {
                    type: "text",
                    text: "大変だったね！次のごほうびは何がいいかな？考えてみて。",
                },
            ]);

        /* 残高不足 */
        } else if (rootBalance < 1000) {
            return client.replyMessage(event.replyToken, [
                {
                    type: "text",
                    text: "おつかれさま!残高が1000円未満なので、ごほうび貯金しなかったよ",
                },
                {
                    type: "text",
                    text: `残高は、親口座：${Number(rootBalance).toLocaleString()}円、ごほうび口座：${Number(childBalance).toLocaleString()}円だよ。`,
                },
            ]);
        
        /* 知らない言葉が来たときの誘導ルート */
        } else {
            return client.replyMessage(event.replyToken,
                {
                    type: "text",
                    text: `どうしたの？疲れた？つらい？残高？`,
                }
            );
        }
    }
}