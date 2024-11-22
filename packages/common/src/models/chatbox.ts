export interface IZulipUser {
  email: string;
  user_id: number;
  avatar_version: number;
  is_admin: boolean;
  is_owner: boolean;
  is_guest: boolean;
  is_billing_admin: boolean;
  role: number;
  is_bot: boolean;
  full_name: string;
  timezone: string;
  is_active: boolean;
  date_joined: string;
  avatar_url: string;
  delivery_email: any;
  assistant_type: number | null;
  evaluation?: { key: string; message: string }[];
}
