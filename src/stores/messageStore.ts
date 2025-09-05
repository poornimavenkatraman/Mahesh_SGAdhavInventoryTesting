import { defineStore } from "pinia";

export const useMessageStore = defineStore("message", {
  state: () => ({
    message: "",
    type: "info", // 'success', 'error', 'info'
    visible: false,
    timeoutId: null as number | null,
  }),
  actions: {
    showMessage(
      msg: string,
      type: "success" | "error" | "info" = "info",
      duration = 3000
    ) {
      this.message = msg;
      this.type = type;
      this.visible = true;
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.timeoutId = window.setTimeout(() => {
        this.visible = false;
        this.message = "";
        this.type = "info";
        this.timeoutId = null;
      }, duration);
    },
    hideMessage() {
      this.visible = false;
      this.message = "";
      this.type = "info";
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.timeoutId = null;
    },
  },
});
