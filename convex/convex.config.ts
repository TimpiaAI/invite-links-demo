import { defineApp } from "convex/server";
import inviteLinks from "convex-invite-links/convex.config";

const app = defineApp();
app.use(inviteLinks);

export default app;
