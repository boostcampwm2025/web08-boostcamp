-- KEYS[1]: updates key
-- KEYS[2]: offset key
-- ARGV[1]: clock (target compaction point)
-- RETURN: { oldOffset: number, newOffset: number }

-- Get current offset (Default to zero)
local offsetStr = redis.call('GET', KEYS[2])
local currentOffset = tonumber(offsetStr or "0")

-- Get target clock
local targetClock = tonumber(ARGV[1])

-- Calculate how many updates to trim
local trimCount = targetClock - currentOffset

if trimCount <= 0 then
  return { currentOffset, currentOffset }
end

-- Calculate how many updates to keep
local updatesLength = redis.call('LLEN', KEYS[1])
local keepCount = updatesLength - trimCount

-- Calculate new offset
local newOffset = currentOffset + trimCount

-- Remove all elements if nothing to keep
if keepCount <= 0 then
  redis.call('DEL', KEYS[1])
  redis.call('SET', KEYS[2], tostring(newOffset))
  return { currentOffset, newOffset }
end

-- Extract remaining elements from the end
local remainingUpdates = redis.call('LRANGE', KEYS[1], -keepCount, -1)

-- Delete entire list
redis.call('DEL', KEYS[1])

-- Recreate list with remaining updates
redis.call('RPUSH', KEYS[1], unpack(remainingUpdates))

redis.call('SET', KEYS[2], tostring(newOffset))

-- Return old offset and new offset
return { currentOffset, newOffset }
