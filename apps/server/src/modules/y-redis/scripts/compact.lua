-- KEYS[1]: updates key
-- KEYS[2]: offset key
-- ARGV[1]: clock (target compaction point)
-- RETURN: { updates: table, newOffset: number }

-- Get current offset (Default to zero)
local offsetStr = redis.call('GET', KEYS[2])
local currentOffset = tonumber(offsetStr or "0")

-- Get target clock
local targetClock = tonumber(ARGV[1])

-- Calculate how many updates to trim
local trimCount = targetClock - currentOffset

if trimCount <= 0 then
  return { {}, currentOffset }
end

-- Fetch updates
local updates = redis.call('LRANGE', KEYS[1], 0, trimCount - 1)
local updatesLength = #updates

if updatesLength == 0 then
  return { {}, currentOffset }
end

-- Calculate new offset
local newOffset = currentOffset + updatesLength

-- Update data
redis.call('LTRIM', KEYS[1], updatesLength, -1)
redis.call('SET', KEYS[2], tostring(newOffset))

-- Return trimmed updates and new offset
return { updates, newOffset }
