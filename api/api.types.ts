export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Order {
  id: string;
  userId: string;
  items: any[];
}
