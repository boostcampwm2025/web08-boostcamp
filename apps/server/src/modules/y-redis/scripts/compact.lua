-- KEYS[1]: updates key
-- KEYS[2]: offset key
-- ARGV[1]: clock (target compaction point)
-- RETURN: { oldOffset: number, newOffset: number }

local updatesKey = KEYS[1]
local offsetKey = KEYS[2]

-- Get current offset (Default to zero)
local offsetStr = redis.call('GET', offsetKey)
local currentOffset = tonumber(offsetStr or "0")

-- Get target clock
local targetClock = tonumber(ARGV[1])

-- Calculate how many updates to trim
local trimCount = targetClock - currentOffset

if trimCount <= 0 then
  return { currentOffset, currentOffset }
end

-- Calculate how many updates to keep
local updatesLength = redis.call('LLEN', updatesKey)
local keepCount = updatesLength - trimCount

-- Calculate new offset
local newOffset = currentOffset + trimCount

-- Remove all elements if nothing to keep
if keepCount <= 0 then
  redis.call('DEL', updatesKey)
  redis.call('SET', offsetKey, tostring(newOffset))
  return { currentOffset, newOffset }
end

-- Extract remaining elements from the end
local remainingUpdates = redis.call('LRANGE', updatesKey, -keepCount, -1)

-- Delete entire list
redis.call('DEL', updatesKey)

-- Recreate list with remaining updates
redis.call('RPUSH', updatesKey, unpack(remainingUpdates))

redis.call('SET', offsetKey, tostring(newOffset))

-- Return old offset and new offset
return { currentOffset, newOffset }
