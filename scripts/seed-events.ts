import { prisma } from "../app/_libs/prisma";

const main = async () => {
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error("ユーザーが1人もいません。先にサインアップしてください。");
  }

  const events = await prisma.event.createManyAndReturn({
    data: [
      {
        title: "秋の池町中央公園 清掃ボランティア",
        description: "みんなで公園をきれいにしましょう。軍手は貸し出しあります。",
        eventDate: new Date("2026-07-15T09:00:00+09:00"),
        place: "池町中央公園",
        lat: 35.7295,
        lng: 139.7109,
        organizerName: "池町町内会",
        organizerLink: null,
        createdBy: user.id,
        status: "published",
      },
      {
        title: "池町日曜朝市 - 夏の収穫祭",
        description: "地元農家の新鮮野菜が並びます。",
        eventDate: new Date("2026-07-20T08:00:00+09:00"),
        place: "池町駅前広場",
        lat: 35.7301,
        lng: 139.7125,
        organizerName: "池町商店街組合",
        organizerLink: "https://example.com/asaichi",
        createdBy: user.id,
        status: "published",
      },
      {
        title: "親子で楽しむ工作教室",
        description: "夏休みの自由研究にもぴったりの工作教室です。",
        eventDate: new Date("2026-08-02T13:00:00+09:00"),
        place: "池町市民センター",
        lat: 35.7288,
        lng: 139.7098,
        organizerName: "池町市民センター",
        organizerLink: null,
        createdBy: user.id,
        status: "published",
      },
    ],
  });

  console.log(`${events.length}件のイベントを作成しました:`);
  for (const e of events) {
    console.log(`  id=${e.id} ${e.eventDate.toISOString().slice(0, 10)} ${e.title}`);
  }
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
