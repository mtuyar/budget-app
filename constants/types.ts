export interface Category {
    [x: string]: string;
    id: string;
    name: string;
    icon: string;
    color: string;
  }
  
  export interface Transaction {
    id: string;
    amount: number;
    categoryId: string;
    type: 'income' | 'expense';
    date: Date;
    description: string;
  }