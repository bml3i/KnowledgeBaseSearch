-- 1. 主表 
CREATE TABLE kb_records ( 
    id          BIGSERIAL PRIMARY KEY, 
    echo_token  VARCHAR(64)  NOT NULL UNIQUE, 
    summary     TEXT         NOT NULL, 
    content     TEXT         NOT NULL, 
    resources   TEXT[]       NOT NULL DEFAULT '{}', 
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(), 
    tags_cache  TEXT[]       NOT NULL DEFAULT '{}', 
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE 
); 


-- 2. 标签维度表（可 ON CONFLICT DO NOTHING 插入） 
CREATE TABLE kb_tags ( 
    id   SERIAL PRIMARY KEY, 
    name VARCHAR(128) UNIQUE NOT NULL 
); 

-- 3. 多对多桥接表 
CREATE TABLE kb_record_tags ( 
    record_id BIGINT NOT NULL REFERENCES kb_records(id) ON DELETE CASCADE, 
    tag_id    INT    NOT NULL REFERENCES kb_tags(id)    ON DELETE CASCADE, 
    PRIMARY KEY (record_id, tag_id) 
); 

-- 4.1. 聚合视图01（方便一次性拿到 tags 数组） 
CREATE OR REPLACE VIEW v_kb_search AS 
SELECT r.id, 
       r.echo_token, 
       r.summary, 
       r.content, 
       r.resources, 
       r.is_active, 
       r.created_at, 
       COALESCE(ARRAY_AGG(t.name ORDER BY t.name), ARRAY[]::TEXT[]) AS tags 
FROM kb_records r 
LEFT JOIN kb_record_tags rt ON rt.record_id = r.id 
LEFT JOIN kb_tags t        ON t.id = rt.tag_id 
GROUP BY r.id; 


-- 4.2. 聚合视图02（方便一次性拿到 tags 数组, 客户端查询时使用） 
CREATE OR REPLACE VIEW v_active_kb_search AS 
SELECT r.id, 

       r.summary, 
       r.content, 
       r.resources, 
       r.is_active, 
       r.created_at, 
       COALESCE(ARRAY_AGG(t.name ORDER BY t.name), ARRAY[]::TEXT[]) AS tags 
FROM kb_records r 
LEFT JOIN kb_record_tags rt ON rt.record_id = r.id 
LEFT JOIN kb_tags t        ON t.id = rt.tag_id 
WHERE r.is_active = TRUE 
GROUP BY r.id 
ORDER BY r.created_at DESC; 

-- 5. 核心索引 
CREATE INDEX idx_kb_tags_cache_gin ON kb_records USING GIN (tags_cache);

-- 6. 插入一些测试数据
INSERT INTO kb_tags (name) VALUES 
('javascript'), 
('python'), 
('database'), 
('frontend'), 
('backend'), 
('api'), 
('security');

INSERT INTO kb_records (echo_token, summary, content, resources, tags_cache, is_active) VALUES 
('token1', 'JavaScript基础知识', 'JavaScript是一种高级的、解释型的编程语言。', '{"https://developer.mozilla.org/"}', '{"javascript", "frontend"}', true),
('token2', 'Python数据分析', 'Python是数据分析的强大工具，结合pandas库可以高效处理数据。', '{"https://pandas.pydata.org/"}', '{"python", "database"}', true),
('token3', 'RESTful API设计', 'REST是一种软件架构风格，用于设计网络应用程序。', '{"https://restfulapi.net/"}', '{"api", "backend"}', true),
('token4', '数据库优化技巧', '索引是提高数据库查询性能的关键。', '{"https://www.postgresql.org/docs/"}', '{"database", "backend"}', true);

-- 7. 建立记录和标签的关联
DO $$ 
DECLARE
    js_id INT;
    py_id INT;
    db_id INT;
    fe_id INT;
    be_id INT;
    api_id INT;
    sec_id INT;
BEGIN
    SELECT id INTO js_id FROM kb_tags WHERE name = 'javascript';
    SELECT id INTO py_id FROM kb_tags WHERE name = 'python';
    SELECT id INTO db_id FROM kb_tags WHERE name = 'database';
    SELECT id INTO fe_id FROM kb_tags WHERE name = 'frontend';
    SELECT id INTO be_id FROM kb_tags WHERE name = 'backend';
    SELECT id INTO api_id FROM kb_tags WHERE name = 'api';
    SELECT id INTO sec_id FROM kb_tags WHERE name = 'security';
    
    INSERT INTO kb_record_tags (record_id, tag_id) VALUES 
    (1, js_id), (1, fe_id),
    (2, py_id), (2, db_id),
    (3, api_id), (3, be_id),
    (4, db_id), (4, be_id);
END $$ LANGUAGE plpgsql;