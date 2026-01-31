import { Timestamp } from "@angular/fire/firestore";

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  displayName: string;
  createdAt: Timestamp;
}