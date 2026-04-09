import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  olfactiveFamily?: string;
  size?: string;
}

export interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  gender: string;
  olfactiveFamily: string;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  imageUrl: string;
  category: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'affiliate';
}

export interface StoreState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Recently Viewed
  recentlyViewed: string[];
  addToRecentlyViewed: (slug: string) => void;
  clearRecentlyViewed: () => void;

  // Product navigation source for breadcrumb
  productSource: 'catalog' | 'search' | 'home' | null;
  setProductSource: (source: 'catalog' | 'search' | 'home' | null) => void;

  // Product Comparison
  compareList: string[];
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;

  // UI State
  currentPage: 'home' | 'catalog' | 'product' | 'cart' | 'checkout' | 'order-success' | 'ai-sommelier' | 'admin' | 'guide' | 'my-account' | 'affiliate';
  setCurrentPage: (page: StoreState['currentPage']) => void;
  
  selectedProductSlug: string | null;
  setSelectedProductSlug: (slug: string | null) => void;
  
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  
  // Filters
  filters: {
    category: string;
    gender: string;
    intensity: string;
    occasion: string;
    timeOfDay: string;
    olfactiveFamily: string;
    fixation: string;
    minPrice: string;
    maxPrice: string;
    search: string;
    sort: string;
  };
  setFilter: (key: keyof StoreState['filters'], value: string) => void;
  resetFilters: () => void;
  
  // AI Sommelier
  sommelierMessages: { role: 'user' | 'assistant'; content: string }[];
  addSommelierMessage: (role: 'user' | 'assistant', content: string) => void;
  clearSommelierMessages: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string, productName: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Selected Size (for product page & quick view)
  selectedSize: string;
  setSelectedSize: (size: string) => void;

  // Quick View
  quickViewProduct: QuickViewProduct | null;
  setQuickViewProduct: (product: QuickViewProduct | null) => void;

  // Cart Badge Pulse
  cartJustUpdated: boolean;
  setCartJustUpdated: (updated: boolean) => void;

  // Last Order
  lastOrderId: string | null;
  setLastOrderId: (id: string | null) => void;
  lastOrderItems: CartItem[];
  setLastOrderItems: (items: CartItem[]) => void;
  lastOrderTotal: number;
  setLastOrderTotal: (total: number) => void;
}

const defaultFilters = {
  category: 'all',
  gender: 'all',
  intensity: 'all',
  occasion: 'all',
  timeOfDay: 'all',
  olfactiveFamily: 'all',
  fixation: 'all',
  minPrice: '',
  maxPrice: '',
  search: '',
  sort: 'sortOrder',
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),

      // Cart
      cart: [],
      addToCart: (item) => {
        const { cart } = get();
        const itemSize = item.size || '100ml';
        const existing = cart.find((i) => i.productId === item.productId && i.size === itemSize);
        if (existing) {
          set({
            cart: cart.map((i) =>
              i.id === existing.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ cart: [...cart, { ...item, size: itemSize, id: `cart-${Date.now()}-${itemSize}` }] });
        }
        // Trigger cart badge pulse
        set({ cartJustUpdated: true });
        setTimeout(() => set({ cartJustUpdated: false }), 1000);
      },
      removeFromCart: (id) => {
        set({ cart: get().cart.filter((i) => i.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        set({
          cart: get().cart.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
      cartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),
      
      // UI State
      currentPage: 'home',
      setCurrentPage: (page) => set({ currentPage: page }),
      
      selectedProductSlug: null,
      setSelectedProductSlug: (slug) => set({ selectedProductSlug: slug }),
      
      isCartOpen: false,
      setIsCartOpen: (open) => set({ isCartOpen: open }),
      
      isMobileMenuOpen: false,
      setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      
      // Filters
      filters: { ...defaultFilters },
      setFilter: (key, value) =>
        set({ filters: { ...get().filters, [key]: value } }),
      resetFilters: () => set({ filters: { ...defaultFilters } }),
      
      // Recently Viewed
      recentlyViewed: [],
      addToRecentlyViewed: (slug) => {
        const { recentlyViewed } = get();
        const filtered = recentlyViewed.filter(s => s !== slug);
        set({ recentlyViewed: [slug, ...filtered].slice(0, 10) });
      },
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),

      // Product navigation source for breadcrumb
      productSource: null,
      setProductSource: (source) => set({ productSource: source }),

      // Product Comparison
      compareList: [],
      toggleCompare: (productId) => {
        const { compareList } = get();
        if (compareList.includes(productId)) {
          set({ compareList: compareList.filter(id => id !== productId) });
        } else {
          if (compareList.length < 4) {
            set({ compareList: [...compareList, productId] });
          }
        }
      },
      clearCompare: () => set({ compareList: [] }),

      // AI Sommelier
      sommelierMessages: [],
      addSommelierMessage: (role, content) =>
        set({ sommelierMessages: [...get().sommelierMessages, { role, content }] }),
      clearSommelierMessages: () => set({ sommelierMessages: [] }),

      // Wishlist
      wishlist: [],
      toggleWishlist: (productId, productName) => {
        const { wishlist } = get();
        if (wishlist.includes(productId)) {
          set({ wishlist: wishlist.filter(id => id !== productId) });
          toast.info(`${productName} removido dos favoritos`);
        } else {
          set({ wishlist: [...wishlist, productId] });
          toast.success(`${productName} adicionado aos favoritos`, {
            description: "Encontre seus favoritos em Minha Conta",
          });
        }
      },
      isInWishlist: (productId) => get().wishlist.includes(productId),

      // Selected Size
      selectedSize: '100ml',
      setSelectedSize: (size) => set({ selectedSize: size }),

      // Quick View
      quickViewProduct: null,
      setQuickViewProduct: (product) => set({ quickViewProduct: product }),

      // Cart Badge Pulse
      cartJustUpdated: false,
      setCartJustUpdated: (updated) => set({ cartJustUpdated: updated }),

      // Last Order
      lastOrderId: null,
      setLastOrderId: (id) => set({ lastOrderId: id }),
      lastOrderItems: [],
      setLastOrderItems: (items) => set({ lastOrderItems: items }),
      lastOrderTotal: 0,
      setLastOrderTotal: (total) => set({ lastOrderTotal: total }),
    }),
    {
      name: 'alma-lik-store',
      partialize: (state) => ({
        cart: state.cart,
        sommelierMessages: state.sommelierMessages,
        wishlist: state.wishlist,
        recentlyViewed: state.recentlyViewed,
        compareList: state.compareList,
        user: state.user,
      }),
    }
  )
);
