import cron from "node-cron";
import { IsNull, LessThan, Not } from "typeorm";
import { Task } from "../../DAL/models/Task.model";
import { ETaskStatusType } from "../app/enum";

const markExpiredTasksAsFailed = async () => {
  try {
    const now = new Date();

    const expiredTasksWithHour = await Task.find({
      where: {
        deadline: LessThan(now),
        hour: LessThan(now),
        status: Not(ETaskStatusType.TEST_FAILED),
      },
    });

    const expiredTasksWithoutHour = await Task.find({
      where: {
        deadline: LessThan(now),
        hour: IsNull(),
        status: Not(ETaskStatusType.TEST_FAILED),
      },
    });

    const expiredTasks = [...expiredTasksWithHour, ...expiredTasksWithoutHour];

    if (expiredTasks.length > 0) {
      console.log(
        `${expiredTasks.length} task deadline-i keçib, statusu FAILED olaraq dəyişdirilir...`
      );

      for (const task of expiredTasks) {
        task.status = ETaskStatusType.TEST_FAILED;
        await task.save();
      }

      console.log("Deadline-i keçmiş taskların statusu FAILED oldu!");
    } else {
      console.log("Deadline-i keçmiş və hələ FAILED olmayan task yoxdur.");
    }
  } catch (error) {
    console.error("Cron job xətası:", error);
  }
};

// Cron job - hər dəqiqə tapşırıqların deadline-larını yoxlayır
cron.schedule("* * * * *", async () => {
  console.log("Cron job başladı: Deadline-i keçmiş taskları yoxlayır...");
  await markExpiredTasksAsFailed();
});

export default markExpiredTasksAsFailed;
