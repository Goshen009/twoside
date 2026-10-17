export interface Announcement {
  id: string;
  message: string;
}

export class Announcements {
  // Append new ones at the bottom. Users see the first one they haven't seen yet.
  // Never reuse or rename an id once it has shipped.
  static LIST: readonly Announcement[] = [
    {
      id: "profile-locale",
      message: "You can now change your currency and timezone. Open Settings, then Edit profile.",
    },
    { 
    	id: "daily-reminders",
     	message: "Daily reminders are here. Open Settings and switch on Daily reminders."
    }
  ];
}