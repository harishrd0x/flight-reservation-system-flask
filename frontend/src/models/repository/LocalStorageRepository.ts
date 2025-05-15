export class LocalStorageRepository<T> {
  private key: string;
  constructor(key: string) {
    this.key = key;
  }

  getAll(): T[] {
    const data = localStorage.getItem(this.key);
    return data ? (JSON.parse(data) as T[]) : [];
  }

  getById(id: string): T | null {
    const items = this.getAll();
    return items.find((item: any) => item.id === id) || null;
  }

  add(item: T): void {
    const items = this.getAll();
    items.push(item);
    this.save(items);
  }

  update(updatedItem: T): void {
    const items = this.getAll();
    const newItems = items.map((item: any) =>
      item.id === (updatedItem as any).id ? updatedItem : item
    );
    this.save(newItems);
  }

  save(items: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}
