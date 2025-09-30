// Declare Supabase generated types module to avoid TypeScript errors
declare module '@supabase/supabase-js' {
  export * from '@supabase/supabase-js/dist/module/index'
}

// Declare mapbox geocoder module
declare module '@mapbox/mapbox-gl-geocoder' {
  const MapboxGeocoder: any
  export default MapboxGeocoder
}
