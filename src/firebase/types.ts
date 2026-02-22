export interface Waypoint {
  id: string;
  address: string;
  stopNumber: number;
  latitude: number;
  longitude: number;
  images: MediaItem[];
}

export interface MediaItem {
  image?: string;
  video?: string;
  likes: number;
  title: string;
  uuid: string;
}

export interface GuestComment {
  id: string;
  name: string;
  comment: string;
  createdAt: Date | null;
}

export interface TripTimes {
  startTime: number | null;
  stopTime: number | null;
}
