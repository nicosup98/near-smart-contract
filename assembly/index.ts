import { context, ContractPromiseBatch } from 'near-sdk-as';
import { Product,listedProducts } from './model/Product'

export function setProduct(product: Product): void{
    const storedProduct = getProduct(product.id)
    if(storedProduct !== null){
        throw new Error(`a product with ${product.id} already exists`);
    }
    listedProducts.set(product.id,Product.fromPayload(product))
}

export function editProduct(newProduct: Product): void{
    if(validateProduct(newProduct)){
        listedProducts.set(newProduct.id,Product.fromPayload(newProduct))
    }

}

export function deleteProduct(product: Product): void{
    if(validateProduct(product)){
        listedProducts.delete(product.id)
    }
}

function validateProduct(newProduct: Product): boolean{
    const product = getProduct(newProduct.id)

    if(product == null){
        throw new Error(`product ${newProduct.id} not found`)
    }

    if(product.owner != newProduct.owner){
        throw new Error(`product its from ${product.owner}`)
    }

    return true
}

export function getProduct(id: string): Product | null{
    return listedProducts.get(id)
}

export function getProducts(): Product[]{
    return listedProducts.values()
}

export function buyProduct(id: string): void{
    const selectedProduct = getProduct(id)
    const amountDeposited = context.attachedDeposit
    if(selectedProduct == null){
        throw new Error('product not found')
    }
    if(selectedProduct.price.toString() != amountDeposited.toString()){
        throw new Error("attached deposit should equal to the product's price");
    }

    ContractPromiseBatch.create(selectedProduct.owner).transfer(amountDeposited)
    selectedProduct.incrementSold()
    listedProducts.set(selectedProduct.id,selectedProduct)
}