export interface Hackathon {
  source: string;
  external_id: string;
  title: string;
  description: string;
  organizer: string | null;
  url: string;
  thumbnail_url: string | null;
  prize: string | null;
  tags: string[];
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  category?: "hackathon" | "contest" | "meetup";
}
