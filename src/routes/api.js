const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all tags with count, optionally filtered by selected tags
router.get('/tags', async (req, res) => {
  try {
    const { selectedTags, keyword } = req.query;
    let query;
    let params = [];
    
    if (selectedTags && selectedTags.length > 0) {
      // 将选中的标签字符串转换为数组
      const tagsArray = Array.isArray(selectedTags) ? selectedTags : selectedTags.split(',');
      
      if (keyword && keyword.trim()) {
        // 同时有标签和关键词过滤
        query = `
          WITH filtered_records AS (
            SELECT r.id
            FROM kb_records r
            JOIN kb_record_tags rt ON r.id = rt.record_id
            JOIN kb_tags t ON rt.tag_id = t.id
            WHERE r.is_active = TRUE 
              AND t.name = ANY($1::varchar[])
              AND (LOWER(r.summary) LIKE LOWER($3) OR LOWER(r.content) LIKE LOWER($3))
            GROUP BY r.id
            HAVING COUNT(DISTINCT t.name) = $2
          )
          SELECT t.name, COUNT(DISTINCT rt.record_id) as count
          FROM kb_tags t
          JOIN kb_record_tags rt ON t.id = rt.tag_id
          JOIN filtered_records fr ON rt.record_id = fr.id
          WHERE t.name <> ALL($1::varchar[])
          GROUP BY t.name
          HAVING COUNT(DISTINCT rt.record_id) > 0
          ORDER BY t.name
        `;
        params = [tagsArray, tagsArray.length, `%${keyword.trim()}%`];
      } else {
        // 只有标签过滤
        query = `
          WITH filtered_records AS (
            SELECT r.id
            FROM kb_records r
            JOIN kb_record_tags rt ON r.id = rt.record_id
            JOIN kb_tags t ON rt.tag_id = t.id
            WHERE r.is_active = TRUE AND t.name = ANY($1::varchar[])
            GROUP BY r.id
            HAVING COUNT(DISTINCT t.name) = $2
          )
          SELECT t.name, COUNT(DISTINCT rt.record_id) as count
          FROM kb_tags t
          JOIN kb_record_tags rt ON t.id = rt.tag_id
          JOIN filtered_records fr ON rt.record_id = fr.id
          WHERE t.name <> ALL($1::varchar[])
          GROUP BY t.name
          HAVING COUNT(DISTINCT rt.record_id) > 0
          ORDER BY t.name
        `;
        params = [tagsArray, tagsArray.length];
      }
    } else if (keyword && keyword.trim()) {
      // 只有关键词过滤，没有标签
      query = `
        SELECT t.name, COUNT(DISTINCT rt.record_id) as count
        FROM kb_tags t
        JOIN kb_record_tags rt ON t.id = rt.tag_id
        JOIN kb_records r ON rt.record_id = r.id
        WHERE r.is_active = TRUE 
          AND (LOWER(r.summary) LIKE LOWER($1) OR LOWER(r.content) LIKE LOWER($1))
        GROUP BY t.name
        HAVING COUNT(DISTINCT rt.record_id) > 0
        ORDER BY t.name
      `;
      params = [`%${keyword.trim()}%`];
    } else {
      // 如果没有选中的标签和关键词，返回所有标签及其计数
      query = `
        SELECT t.name, COUNT(rt.record_id) as count
        FROM kb_tags t
        LEFT JOIN kb_record_tags rt ON t.id = rt.tag_id
        LEFT JOIN kb_records r ON rt.record_id = r.id AND r.is_active = TRUE
        GROUP BY t.name
        HAVING COUNT(rt.record_id) > 0
        ORDER BY t.name
      `;
    }
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get knowledge base records filtered by tags
router.get('/records', async (req, res) => {
  try {
    const { tags, keyword, page = 1, limit = process.env.ITEMS_PER_PAGE || 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query;
    let params = [limit, offset];
    
    if (tags && tags.length > 0 && keyword && keyword.trim()) {
      // 同时有标签和关键词过滤
      const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
      query = `
        SELECT *
        FROM v_active_kb_search
        WHERE tags @> $3::varchar[]
          AND (LOWER(summary) LIKE LOWER($4) OR LOWER(content) LIKE LOWER($4))
        LIMIT $1 OFFSET $2
      `;
      params.push(tagsArray, `%${keyword.trim()}%`);
    } else if (tags && tags.length > 0) {
      // 只有标签过滤
      const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
      query = `
        SELECT *
        FROM v_active_kb_search
        WHERE tags @> $3::varchar[]
        LIMIT $1 OFFSET $2
      `;
      params.push(tagsArray);
    } else if (keyword && keyword.trim()) {
      // 只有关键词过滤
      query = `
        SELECT *
        FROM v_active_kb_search
        WHERE LOWER(summary) LIKE LOWER($3) OR LOWER(content) LIKE LOWER($3)
        LIMIT $1 OFFSET $2
      `;
      params.push(`%${keyword.trim()}%`);
    } else {
      // 没有过滤条件
      query = `
        SELECT *
        FROM v_active_kb_search
        LIMIT $1 OFFSET $2
      `;
    }
    
    // Get records
    const records = await db.query(query, params);
    
    // Get total count for pagination
    let countQuery;
    let countParams = [];
    
    if (tags && tags.length > 0 && keyword && keyword.trim()) {
      // 同时有标签和关键词过滤
      const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
      countQuery = `
        SELECT COUNT(*)
        FROM v_active_kb_search
        WHERE tags @> $1::varchar[]
          AND (LOWER(summary) LIKE LOWER($2) OR LOWER(content) LIKE LOWER($2))
      `;
      countParams.push(tagsArray, `%${keyword.trim()}%`);
    } else if (tags && tags.length > 0) {
      // 只有标签过滤
      const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
      countQuery = `
        SELECT COUNT(*)
        FROM v_active_kb_search
        WHERE tags @> $1::varchar[]
      `;
      countParams.push(tagsArray);
    } else if (keyword && keyword.trim()) {
      // 只有关键词过滤
      countQuery = `
        SELECT COUNT(*)
        FROM v_active_kb_search
        WHERE LOWER(summary) LIKE LOWER($1) OR LOWER(content) LIKE LOWER($1)
      `;
      countParams.push(`%${keyword.trim()}%`);
    } else {
      // 没有过滤条件
      countQuery = `
        SELECT COUNT(*)
        FROM v_active_kb_search
      `;
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    res.json({
      records: records.rows,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single knowledge base record by ID
router.get('/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query('SELECT * FROM v_kb_search WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;