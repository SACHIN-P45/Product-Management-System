export interface Product {
    id: number;
    name: string;
    price: number | string;
    stock: number;
    created_at?: string;
}

export interface ProductsResponse {
    data: Product[];
    total: number;
    limit: number;
    offset: number;
}
