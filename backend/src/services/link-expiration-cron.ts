import cron from "node-cron";
import { UrlModel } from "../models/url.model";
import { UserModel } from "../models/user.model";
import { LinkStatus } from "../types/link-status.enum";

const migrateExistingLinks = async () => {
  try {
    const result = await UrlModel.updateMany(
      { status: { $exists: false } },
      {
        $set: {
          status: LinkStatus.ACTIVE,
          deleteAfterExpiredDays: 30,
        },
      }
    );
    if (result.modifiedCount > 0) {
      console.log(
        `[Cron] Migrated ${result.modifiedCount} links to active status`
      );
    }
  } catch (error) {
    console.error("[Cron] Migration error:", error);
  }
};

const markExpiredLinks = async () => {
  try {
    const now = new Date();

    const result = await UrlModel.updateMany(
      {
        status: LinkStatus.ACTIVE,
        $or: [
          { expirationDate: { $lt: now, $ne: null } },
          { planExpiresAt: { $lt: now, $ne: null } },
        ],
      },
      {
        $set: {
          status: LinkStatus.EXPIRED,
          expiredAt: now,
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[Cron] Marked ${result.modifiedCount} links as expired`
      );
    }
  } catch (error) {
    console.error("[Cron] Error marking expired links:", error);
  }
};

const hardDeleteExpiredLinks = async () => {
  try {
    const expiredLinks = await UrlModel.find({
      status: LinkStatus.EXPIRED,
      expiredAt: { $ne: null },
      deleteAfterExpiredDays: { $ne: null },
    });

    const now = Date.now();
    let deletedCount = 0;

    for (const link of expiredLinks) {
      const retentionMs = link.deleteAfterExpiredDays * 86400000;
      const expiredAtMs = new Date(link.expiredAt).getTime();

      if (now - expiredAtMs > retentionMs) {
        // findOneAndDelete triggers the post hook for Analytics/Visit cleanup
        await UrlModel.findOneAndDelete({ _id: link._id });

        await UserModel.findByIdAndUpdate(link.user, {
          $pull: { shortLinks: link._id },
        });

        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[Cron] Hard deleted ${deletedCount} expired links`);
    }
  } catch (error) {
    console.error("[Cron] Error deleting expired links:", error);
  }
};

export const startLinkExpirationCron = () => {
  // Run migration on boot
  migrateExistingLinks();

  // Run daily at 2:00 AM
  cron.schedule("2 0 * * *", async () => {
    console.log("[Cron] Running link expiration check...");
    await markExpiredLinks();
    await hardDeleteExpiredLinks();
    console.log("[Cron] Link expiration check complete.");
  });

  console.log("[Cron] Link expiration cron job registered (daily at 2:00 AM)");
};
