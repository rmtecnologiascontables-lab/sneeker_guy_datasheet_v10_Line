import { Category } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'ropa',
    name: 'Ropa y Prendas',
    icon: 'tshirt',
    subcategories: [
      'Manga larga', 'Manga corta', 'Sin mangas', 
      'Jeans', 'Chinos', 'Joggers', 'Leggings', 
      'Vestidos y Monos', 
      'Cuero', 'Plumas', 'Trench', 'Bombers', 
      'Sudaderas', 'Hoodies', 
      'Brasieres', 'Calzones', 'Bóxers', 
      'Pijamas', 
      'Bikinis', 'Enterizos', 'Trunks', 
      'Shorts Deportivos', 'Tops Deportivos', 'Mallas Deportivas',
      'Faldas', 'Suéteres', 'Cárdigans'
    ],
    isActive: true
  },
  {
    id: 'calzado',
    name: 'Calzado',
    icon: 'shoe-prints',
    subcategories: [
      'Mocasines', 'Loafers', 'Oxford', 'Tacones', 'Bailarinas',
      'Running', 'Entrenamiento', 'Hiking',
      'Botas Diesel', 'Botas Militares', 'Chelsea', 'Botas de Lluvia',
      'Sandalias', 'Chanclas', 'Zuecos', 'Alpargatas',
      'Zapatos Industriales', 'Punta de acero'
    ],
    isActive: true
  },
  {
    id: 'accesorios',
    name: 'Accesorios Personales',
    icon: 'gem',
    subcategories: [
      'Aretes', 'Anillos', 'Collares', 'Pulseras', 'Diademas',
      'Análogos', 'Digitales', 'Relojes Inteligentes',
      'Lentes de Sol', 'Lentes de Lectura', 'Lentes Blue light',
      'Cinturones de Piel', 'Cinturones de Tela', 'Cinturones Reversibles',
      'Billeteras', 'Tarjeteros', 'Bufandas', 'Guantes', 'Gorros',
      'Sombrillas', 'Paraguas', 'Bum bags', 'Tote bags'
    ],
    isActive: true
  },
  {
    id: 'cuidado',
    name: 'Cuidado Personal e Higiene',
    icon: 'spa',
    subcategories: [
      'Limpiadores Faciales', 'Cremas', 'Mascarillas',
      'Lociones', 'Exfoliantes', 'Aceites',
      'Shampoo', 'Acondicionador', 'Tintes',
      'Perfumes', 'Colonias', 'Aguas de tocador',
      'Desodorantes', 'Maquinillas de afeitar', 'Cepillos Eléctricos', 'Kits de manicura', 'Productos para barba'
    ],
    isActive: true
  },
  {
    id: 'electronica',
    name: 'Electrónicos',
    icon: 'mobile-alt',
    subcategories: [
      'Apple', 'Samsung', 'Xiaomi', 'Motorola', 'Google Pixel', 'OnePlus',
      'iPad', 'Galaxy Tab', 'Lenovo Tab', 'Huawei Tab',
      'AirPods', 'Galaxy Buds', 'Sony Headphones', 'JBL Headphones',
      'Apple Watch', 'Galaxy Watch', 'Mi Band', 'Garmin',
      'Parlantes JBL', 'Parlantes Sony', 'Parlantes Bose', 'Parlantes Marshall',
      'Cargadores Inalámbricos', 'Power banks',
      'Fundas', 'Protectores', 'Soportes',
      'HP Laptops', 'Dell Laptops', 'MacBook',
      'GoPro', 'Insta360', 'Sony Cameras', 'Canon Cameras',
      'Rasuradoras Eléctricas', 'Secadores', 'Planchas de Pelo'
    ],
    isActive: true
  },
  {
    id: 'deportes',
    name: 'Accesorios Deportivos',
    icon: 'bicycle',
    subcategories: [
      'Gorras', 'Viseras', 
      'Botellas Stanley', 'Botellas Contigo', 'Hydro Flask',
      'Mochilas de hidratación', 'Fitbit', 'Garmin Trackers', 'Gafas deportivas'
    ],
    isActive: true
  },
  {
    id: 'pequenos',
    name: 'Pequeños Artículos',
    icon: 'grip-lines',
    subcategories: [
      'Calcetines Deportivos', 'Calcetines Formales', 'Llaveros', 'Lanyards', 'Fundas para pasaporte', 'Porta-airpods', 'Espejos de bolsillo'
    ],
    isActive: true
  }
];
