-- KEYS[1]: updates key
-- KEYS[2]: offset key
-- ARGV[1]: clock (logical clock to start fetching from)
-- RETURN: { updates: Buffer[], offset: number }

-- Get current offset (Default to zero)
local offsetStr = redis.call('GET', KEYS[2])
local offset = tonumber(offsetStr or "0")

-- Calculate physical start index
local clock = tonumber(ARGV[1])
local index = clock - offset

if index < 0 then index = 0 end

-- Fetch updates from physical index to end
local updates = redis.call('LRANGE', KEYS[1], index, -1)

-- Return updates and offset
return { updates, offset }
