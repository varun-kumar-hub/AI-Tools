import { createClient } from '@supabase/supabase-js';
import config from '../config';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for API calls
export const toolsAPI = {
  async getAll(params = {}) {
    const { category, search, limit = 100, offset = 0 } = params;

    let query = supabase
      .from('ai_tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Filter out deleted items (assuming is_deleted column exists)
    // We check for false or null to be safe for migration
    query = query.is('is_deleted', false);


    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(tool) {
    const { data, error } = await supabase
      .from('ai_tools')
      .insert([tool])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('ai_tools')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('ai_tools')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('category');

    if (error) throw error;

    // Count categories
    const categoryCounts = {};
    data.forEach(item => {
      const category = item.category || 'Other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const categoryIds = {
      'Code & Development': '1',
      'Data Analysis': '2',
      'Productivity': '3',
      'Video & Audio': '4',
      'Research & Education': '5',
      'Design & Creative': '6',
      'Marketing & Sales': '7',
      'Content Writing': '8',
      'Customer Service': '9',
      'Other': '10'
    };

    return Object.entries(categoryCounts).map(([name, count]) => ({
      id: categoryIds[name] || '10',
      name,
      count
    }));
  },

  async getStats() {
    try {
      // 1. Get total count
      const { count: totalTools, error: countError } = await supabase
        .from('ai_tools')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false);

      if (countError) throw countError;

      // 2. Get categories count (reuse existing function logic but optimized)
      // For stats we just need the number of unique categories
      // We can use the existing getCategories which is already client-side optimized
      const categoriesData = await this.getCategories();
      const categoriesCount = categoriesData.length;

      // 3. Get added today count
      const today = new Date().toISOString().split('T')[0];
      const { count: addedToday, error: todayError } = await supabase
        .from('ai_tools')
        .select('*', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .gte('created_at', `${today}T00:00:00`);

      if (todayError) throw todayError;

      // 4. Tags tracked (Approximation or fetch all tags)
      // Fetching all tags is heavy, but let's do a lightweight fetch of just tags column
      // for a "good enough" count or just hardcode a base if too heavy. 
      // Let's try fetching just tags for now.
      const { data: tagsData, error: tagsError } = await supabase
        .from('ai_tools')
        .select('tags')
        .eq('is_deleted', false);

      if (tagsError) throw tagsError;

      const uniqueTags = new Set();
      tagsData?.forEach(item => {
        item.tags?.forEach(tag => uniqueTags.add(tag));
      });

      // Calculate next scrape time (Deterministic: Every 1 hour)
      const now = new Date();
      const currentHour = now.getUTCHours();
      // Next hour
      let nextHour = currentHour + 1;

      const nextScrapeDate = new Date(now);
      nextScrapeDate.setUTCMinutes(0, 0, 0);

      if (nextHour >= 24) {
        nextScrapeDate.setUTCDate(now.getUTCDate() + 1);
        nextScrapeDate.setUTCHours(0);
      } else {
        nextScrapeDate.setUTCHours(nextHour);
      }

      return {
        totalTools: totalTools || 0,
        addedToday: addedToday || 0,
        tagsTracked: uniqueTags.size || 0,
        categories: categoriesCount || 0,
        next_scrape_time: nextScrapeDate.toISOString()
      };

    } catch (error) {
      console.error('Error fetching stats from Supabase:', error);
      return {
        totalTools: 0,
        addedToday: 0,
        tagsTracked: 0,
        categories: 0
      };
    }
  }
};
