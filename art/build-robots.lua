-- Draws every animated sprite and scene background used by the robot simulations,
-- in the same warm cream / navy / orange pixel-art style as the lesson pictures.
-- Run:  aseprite -b --script-param src=art/robots --script-param png=public/images/robots --script art/build-robots.lua
-- Each sprite is saved as an .aseprite file (one frame per animation step, with a loop tag)
-- and as a horizontal PNG sprite sheet that the website reads. 1 art pixel = 1 scene unit.

local SRC = app.params["src"]
local PNG = app.params["png"]
local PX = app.pixelColor

local function C(hex)
  return PX.rgba(tonumber(hex:sub(2, 3), 16), tonumber(hex:sub(4, 5), 16), tonumber(hex:sub(6, 7), 16), 255)
end

-- palettes: { base, highlight, shade }
local cream = { "#ebe0c9", "#faf3e2", "#c4b394" }
local white = { "#f1ede4", "#ffffff", "#c7c2b6" }
local navy = { "#2f4868", "#5378a3", "#1d2d45" }
local steel = { "#727f8e", "#a2aebb", "#48525f" }
local dark = { "#333c49", "#4d5866", "#1f252f" }
local orange = { "#e8743c", "#ff9b62", "#b3502a" }
local yellow = { "#f2b632", "#ffd76a", "#c48a14" }
local red = { "#d8533f", "#ff8a72", "#a1372a" }
local blue = { "#3f7fc4", "#74a9e6", "#2a5a93" }
local green = { "#5aa35a", "#8fce85", "#3a7440" }
local wood = { "#d8a668", "#f0c688", "#a87a40" }
local OL = C("#1a1f2b")

local function R(img, x, y, w, h, c)
  x, y, w, h = math.floor(x), math.floor(y), math.floor(w), math.floor(h)
  if type(c) == "string" then c = C(c) end
  for j = y, y + h - 1 do
    for i = x, x + w - 1 do
      if i >= 0 and j >= 0 and i < img.width and j < img.height then img:drawPixel(i, j, c) end
    end
  end
end

local function Px(img, x, y, c)
  if type(c) == "string" then c = C(c) end
  if x >= 0 and y >= 0 and x < img.width and y < img.height then img:drawPixel(x, y, c) end
end

-- shaded box with outline; rd rounds the corners
local function Bx(img, x, y, w, h, pal, rd)
  R(img, x, y, w, h, OL)
  R(img, x + 1, y + 1, w - 2, h - 2, pal[1])
  R(img, x + 1, y + 1, w - 2, 2, pal[2])
  R(img, x + 1, y + 1, 2, h - 2, pal[2])
  R(img, x + 1, y + h - 3, w - 2, 2, pal[3])
  R(img, x + w - 3, y + 1, 2, h - 2, pal[3])
  if rd then
    for _, p in ipairs({ { x, y }, { x + w - 1, y }, { x, y + h - 1 }, { x + w - 1, y + h - 1 } }) do
      if p[1] >= 0 and p[2] >= 0 and p[1] < img.width and p[2] < img.height then img:drawPixel(p[1], p[2], 0) end
    end
  end
end

-- shaded disc with outline
local function Disc(img, cx, cy, r, pal)
  for y = -r, r do
    for x = -r, r do
      local d = math.sqrt(x * x + y * y)
      if d <= r then
        local c
        if d > r - 1.2 then
          c = OL
        elseif x + y < -r * 0.55 then
          c = C(pal[2])
        elseif x + y > r * 0.55 then
          c = C(pal[3])
        else
          c = C(pal[1])
        end
        Px(img, cx + x, cy + y, c)
      end
    end
  end
end

-- checkerboard dither between two colours
local function Dz(img, x, y, w, h, c1, c2)
  for j = y, y + h - 1 do
    for i = x, x + w - 1 do
      Px(img, i, j, ((i + j) % 2 == 0) and c1 or c2)
    end
  end
end

local function build(name, w, h, frames, draw, duration)
  local images = {}
  for f = 1, frames do
    local img = Image(w, h)
    draw(img, f - 1)
    images[f] = img
  end
  local spr = Sprite(w, h, ColorMode.RGB)
  for _ = 2, frames do spr:newEmptyFrame() end
  for f = 1, frames do
    spr.frames[f].duration = duration or 0.12
    spr:newCel(spr.layers[1], f, images[f], Point(0, 0))
  end
  spr:newTag(1, frames).name = "loop"
  spr:saveAs(SRC .. "/" .. name .. ".aseprite")
  local sheet = Image(w * frames, h)
  for f = 1, frames do sheet:drawImage(images[f], Point((f - 1) * w, 0)) end
  sheet:saveAs(PNG .. "/" .. name .. ".png")
  spr:close()
end

local blink = { "#ffb347", "#ffd98a", "#e8743c", "#ffd98a" }
local lamp = { "#7ee081", "#4fbf68", "#2f8a4a", "#4fbf68" }

----------------------------------------------------------------------------------------------
-- Robot arm and cobot
----------------------------------------------------------------------------------------------
local function armBase(body, accent)
  return function(img, f)
    -- pedestal
    Bx(img, 10, 22, 36, 12, dark)
    Bx(img, 4, 28, 48, 6, steel)
    R(img, 8, 30, 3, 2, "#c9d2db")
    R(img, 45, 30, 3, 2, "#c9d2db")
    -- turret
    Bx(img, 12, 2, 32, 22, body, true)
    Bx(img, 12, 16, 32, 6, accent)
    R(img, 16, 8, 8, 2, body[3])
    R(img, 16, 12, 8, 2, body[3])
    -- status light
    R(img, 34, 6, 6, 5, OL)
    R(img, 35, 7, 4, 3, blink[f + 1])
  end
end
build("arm-base", 56, 34, 4, armBase(cream, orange), 0.25)
build("cobot-base", 56, 34, 4, armBase(white, blue), 0.25)

build("joint", 24, 24, 4, function(img, f)
  Disc(img, 11, 11, 11, navy)
  Disc(img, 11, 11, 7, dark)
  -- bolts
  for _, p in ipairs({ { 7, 7 }, { 15, 7 }, { 7, 15 }, { 15, 15 } }) do R(img, p[1], p[2], 2, 2, "#8fa0b3") end
  -- rotating status pixel on the rim
  local ring = { { 11, 1 }, { 20, 11 }, { 11, 20 }, { 2, 11 } }
  R(img, ring[f + 1][1] - 1, ring[f + 1][2] - 1, 3, 3, blink[1])
end, 0.2)

local function gripper(wrist)
  return function(img, f)
    -- 0 open, 1 half closed, 2 closed
    Bx(img, 8, 0, 16, 8, navy)
    Bx(img, 5, 7, 22, 12, wrist, true)
    R(img, 5, 12, 22, 2, C(orange[1]))
    R(img, 14, 9, 4, 2, blink[1])
    local left = { 4, 8, 11 }
    local right = { 20, 16, 13 }
    local length = { 14, 13, 12 }
    for _, x in ipairs({ left[f + 1], right[f + 1] }) do
      Bx(img, x, 18, 7, length[f + 1], dark)
      R(img, x + 2, 18 + length[f + 1] - 5, 3, 3, "#9aa6b4")
    end
  end
end
build("arm-gripper", 32, 34, 3, gripper(cream))
build("cobot-gripper", 32, 34, 3, gripper(white))

build("metal-block", 22, 18, 1, function(img)
  Bx(img, 0, 0, 22, 18, steel)
  Disc(img, 11, 9, 4, dark)
  R(img, 4, 3, 3, 2, "#c9d2db")
end)

----------------------------------------------------------------------------------------------
-- SCARA
----------------------------------------------------------------------------------------------
build("scara-head", 36, 44, 4, function(img, f)
  Bx(img, 2, 0, 32, 10, navy, true)
  Bx(img, 4, 8, 28, 36, cream, true)
  R(img, 4, 22, 28, 6, C(navy[1]))
  R(img, 6, 30, 2, 8, C(cream[3]))
  R(img, 10, 30, 2, 8, C(cream[3]))
  R(img, 25, 32, 5, 5, OL)
  R(img, 26, 33, 3, 3, blink[f + 1])
end, 0.25)

build("scara-tool", 24, 36, 4, function(img, f)
  Bx(img, 6, 0, 12, 12, navy)
  Bx(img, 9, 11, 6, 12, steel)
  local closed = f >= 2
  local gap = closed and 2 or 7
  local cx = 12
  Bx(img, cx - gap - 3, 22, 5, closed and 12 or 14, dark)
  Bx(img, cx + gap - 2, 22, 5, closed and 12 or 14, dark)
  R(img, 11, 3, 2, 2, blink[(f % 2) + 1])
end, 0.2)

build("plate", 28, 10, 1, function(img)
  Bx(img, 0, 0, 28, 10, steel)
  for _, x in ipairs({ 5, 13, 21 }) do R(img, x, 4, 3, 3, OL) end
end)

----------------------------------------------------------------------------------------------
-- Delta
----------------------------------------------------------------------------------------------
build("delta-frame", 216, 34, 4, function(img, f)
  -- side motor housings
  Bx(img, 0, 6, 74, 22, cream, true)
  Bx(img, 142, 6, 74, 22, cream, true)
  Bx(img, 0, 6, 18, 24, orange, true)
  Bx(img, 198, 6, 18, 24, orange, true)
  -- centre body
  Bx(img, 58, 0, 100, 30, cream, true)
  R(img, 60, 14, 96, 14, C(navy[1]))
  R(img, 60, 14, 96, 2, C(navy[2]))
  R(img, 100, 4, 16, 10, OL)
  R(img, 101, 5, 14, 8, orange[1])
  -- motor status lights
  local lights = { { 6, 12 }, { 105, 8 }, { 204, 12 } }
  for i, l in ipairs(lights) do
    R(img, l[1], l[2], 5, 5, OL)
    R(img, l[1] + 1, l[2] + 1, 3, 3, (f % 3 == i - 1) and "#ffe9a8" or "#7a3a1a")
  end
  -- rod mounts
  for _, x in ipairs({ 20, 104, 188 }) do Bx(img, x, 26, 10, 8, dark) end
end, 0.2)

build("delta-platform", 44, 32, 4, function(img, f)
  Bx(img, 4, 0, 36, 10, dark, true)
  Disc(img, 6, 5, 4, steel)
  Disc(img, 38, 5, 4, steel)
  Bx(img, 16, 8, 12, 8, steel)
  local open = f < 2
  local gap = open and 8 or 3
  Bx(img, 22 - gap - 3, 14, 5, 15, dark)
  Bx(img, 22 + gap - 2, 14, 5, 15, dark)
  R(img, 20, 10, 4, 2, blink[(f % 2) + 1])
end, 0.2)

build("cube-red", 20, 18, 1, function(img)
  Bx(img, 0, 0, 20, 18, red)
end)

----------------------------------------------------------------------------------------------
-- Cartesian gantry
----------------------------------------------------------------------------------------------
build("gantry-rail", 336, 16, 4, function(img, f)
  Bx(img, 0, 0, 336, 16, cream)
  R(img, 4, 6, 328, 4, C(navy[1]))
  R(img, 4, 6, 328, 1, C(navy[2]))
  for i = 0, 40 do
    R(img, (10 + i * 8 + f * 2) % 320 + 4, 7, 2, 2, "#8fa0b3")
  end
  Bx(img, 0, 0, 14, 16, dark)
  Bx(img, 322, 0, 14, 16, dark)
end, 0.2)

build("gantry-carriage", 36, 30, 4, function(img, f)
  Bx(img, 0, 0, 36, 30, cream, true)
  R(img, 0, 22, 36, 8, C(navy[1]))
  R(img, 0, 22, 36, 2, C(navy[2]))
  Disc(img, 6, 15, 3, dark)
  Disc(img, 30, 15, 3, dark)
  R(img, 16, 6, 4, 4, OL)
  R(img, 17, 7, 2, 2, lamp[f + 1])
end, 0.25)

build("gantry-tool", 28, 30, 4, function(img, f)
  Bx(img, 4, 0, 20, 12, navy, true)
  Bx(img, 8, 10, 12, 8, steel)
  Bx(img, 6, 17, 6, 12, dark)
  Bx(img, 16, 17, 6, 12, dark)
  R(img, 12 + (f % 2), 4, 4, 3, blink[f + 1])
end, 0.2)

build("scan-pulse", 64, 64, 5, function(img, f)
  local radius = 6 + f * 6
  local alpha = 255 - f * 45
  for y = 0, 63 do
    for x = 0, 63 do
      local d = math.sqrt((x - 31.5) ^ 2 + (y - 31.5) ^ 2)
      if math.abs(d - radius) < 1.3 then img:drawPixel(x, y, PX.rgba(255, 179, 71, alpha)) end
    end
  end
end, 0.18)

----------------------------------------------------------------------------------------------
-- Humanoid (96x96 canvas: character centred on x=32, speech bubble on the right)
----------------------------------------------------------------------------------------------
local function humanoid(mode)
  return function(img, f)
    local swing, bob, eyesClosed = 0, 0, false
    local swings = { 0, 5, 9, 0, -5, -9 }
    if mode == "idle" then
      bob = (f == 1 or f == 2) and 1 or 0
      eyesClosed = f == 3
    elseif mode == "walk" then
      swing = swings[f + 1]
      bob = (f % 3 == 1) and 1 or 0
    else
      bob = (f % 2 == 1) and 1 or 0
      eyesClosed = f == 3
    end
    local top = 4 + bob -- head top

    local function leg(cx, off, lift)
      local x = cx + off
      -- thigh, knee cap, shin, foot
      Bx(img, x - 6, 62 - bob, 13, 14, cream, true)
      Bx(img, x - 7, 74 - bob - lift, 15, 8, navy, true)
      R(img, x - 1, 77 - bob - lift, 3, 3, C(orange[1]))
      Bx(img, x - 5, 80 - bob - lift, 11, 11, cream, true)
      Bx(img, x - 8, 89 - bob - lift, 18, 7, navy, true)
    end
    leg(26, swing // 2, swing > 0 and 3 or 0)
    leg(40, -swing // 2, swing < 0 and 3 or 0)

    -- pelvis
    Bx(img, 18, 54 - bob, 28, 10, cream, true)
    R(img, 22, 58 - bob, 20, 3, C(dark[1]))

    -- arms
    local function arm(x, y, raised)
      Disc(img, x + 5, y + 4 - bob, 6, navy)
      if raised then
        Bx(img, x + 6, y - 14 - bob, 9, 16, cream, true)
        Disc(img, x + 10, y - 16 - bob, 4, orange)
        Bx(img, x + 6, y - 28 - bob, 9, 13, cream, true)
        Bx(img, x + 6, y - 35 - bob, 9, 8, dark, true)
      else
        Bx(img, x, y + 6 - bob, 10, 16, cream, true)
        Disc(img, x + 5, y + 24 - bob, 4, orange)
        Bx(img, x + 1, y + 26 - bob, 9, 14, cream, true)
        Bx(img, x + 1, y + 39 - bob, 9, 8, dark, true)
      end
    end
    arm(8, 22 + (swing > 0 and 2 or 0), false)
    if mode == "signal" then
      arm(46, 22, true)
    else
      arm(46, 22 + (swing < 0 and 2 or 0), false)
    end

    -- torso
    Bx(img, 16, 22 - bob, 32, 34, cream, true)
    Bx(img, 12, 20 - bob, 12, 12, navy, true)
    Bx(img, 40, 20 - bob, 12, 12, navy, true)
    R(img, 26, 30 - bob, 12, 4, OL)
    R(img, 27, 31 - bob, 10, 2, orange[1])
    R(img, 22, 38 - bob, 20, 12, C(dark[1]))
    R(img, 22, 38 - bob, 20, 2, C(dark[2]))
    R(img, 25, 42 - bob, 4, 4, lamp[f % 4 + 1])
    R(img, 31, 42 - bob, 4, 4, "#5aa9e6")

    -- neck + head
    R(img, 28, 17 - bob, 8, 6, C(dark[1]))
    Bx(img, 20, top - 4, 24, 20, cream, true)
    R(img, 23, top + 2, 18, 9, OL)
    if eyesClosed then
      R(img, 26, top + 7, 5, 1, orange[1])
      R(img, 33, top + 7, 5, 1, orange[1])
    else
      Disc(img, 28, top + 6, 3, orange)
      Disc(img, 36, top + 6, 3, orange)
    end
    R(img, 31, top - 8, 2, 5, OL)
    R(img, 30, top - 10, 4, 3, yellow[1])
    Bx(img, 16, top + 3, 5, 8, navy)
    Bx(img, 43, top + 3, 5, 8, navy)

    if mode == "signal" then
      local by = (f % 2 == 1) and 0 or 2
      Bx(img, 64, by, 30, 22, yellow, true)
      R(img, 77, by + 5, 4, 8, OL)
      R(img, 77, by + 15, 4, 3, OL)
      R(img, 62, by + 20, 6, 4, C(yellow[1]))
    end
  end
end
build("humanoid-idle", 96, 96, 4, humanoid("idle"), 0.3)
build("humanoid-walk", 96, 96, 6, humanoid("walk"), 0.12)
build("humanoid-signal", 96, 96, 4, humanoid("signal"), 0.25)

----------------------------------------------------------------------------------------------
-- Autonomous mobile robot (top-down view, facing right)
----------------------------------------------------------------------------------------------
local cardboard = { "#c39a63", "#dfb883", "#9a7546" }

build("amr-top", 72, 48, 4, function(img, f)
  -- soft shadow under the body
  R(img, 8, 11, 62, 34, PX.rgba(0, 0, 0, 60))
  -- four wheels with tread marks that roll while the robot drives
  for _, y in ipairs({ 2, 39 }) do
    for _, x in ipairs({ 10, 46 }) do
      Bx(img, x, y, 16, 7, dark)
      for i = 0, 3 do R(img, x + 2 + ((i * 4 + f * 3) % 12), y + 2, 1, 3, "#6b7686") end
    end
  end
  -- cream shell
  Bx(img, 4, 7, 64, 34, cream, true)
  R(img, 10, 11, 40, 2, orange[1])
  R(img, 10, 35, 40, 2, orange[1])
  -- front bumper and headlights
  Bx(img, 58, 9, 10, 30, dark)
  R(img, 60, 10, 2, 28, orange[1])
  R(img, 66, 11, 3, 5, blink[f + 1])
  R(img, 66, 32, 3, 5, blink[f + 1])
  -- control panel on the roof
  Bx(img, 12, 15, 26, 18, navy)
  R(img, 16, 22, 18, 1, "#5378a3")
  R(img, 16, 26, 18, 1, "#5378a3")
  R(img, 32, 17, 3, 3, lamp[f + 1])
end, 0.1)

build("amr-lidar-top", 16, 16, 4, function(img, f)
  Disc(img, 8, 8, 7, dark)
  Disc(img, 8, 8, 4, steel)
  R(img, 4, 7, 9, 2, C(yellow[1]))
  local sweep = { { 8, 2 }, { 13, 8 }, { 8, 13 }, { 3, 8 } }
  R(img, sweep[f + 1][1], sweep[f + 1][2], 2, 2, "#ffffff")
end, 0.15)

build("amr-tote-top", 40, 28, 1, function(img)
  Bx(img, 0, 0, 40, 28, blue, true)
  R(img, 4, 4, 32, 20, C(blue[3]))
  Bx(img, 6, 6, 15, 11, cardboard)
  R(img, 12, 6, 2, 11, C(cardboard[3]))
  Bx(img, 22, 10, 12, 12, cardboard)
  R(img, 27, 10, 2, 12, C(cardboard[3]))
end)

----------------------------------------------------------------------------------------------
-- Conveyor belt
----------------------------------------------------------------------------------------------
build("belt", 330, 36, 4, function(img, f)
  Bx(img, 0, 6, 330, 24, dark)
  for i = 0, 30 do
    local x = (6 + i * 11 + f * 3) % 330
    R(img, x, 9, 2, 12, C("#48535f"))
  end
  R(img, 0, 6, 330, 2, C("#5a6675"))
  -- steel side rail with bolts
  Bx(img, 0, 22, 330, 12, steel)
  for i = 0, 15 do Disc(img, 14 + i * 21, 28, 3, dark) end
  -- end caps
  Bx(img, 0, 4, 12, 30, navy)
  Bx(img, 318, 4, 12, 30, navy)
end, 0.12)

----------------------------------------------------------------------------------------------
-- Scene backgrounds (400x260)
----------------------------------------------------------------------------------------------
local function tree(img, x, y, s)
  R(img, x + s // 2 - 1, y + s, 3, s // 2, "#6d4c2f")
  Disc(img, x + s // 2, y + s // 2, s // 2, { "#5aa35a", "#8fce85", "#3a7440" })
end

local function window(img, x, y, w, h, silhouettes)
  R(img, x, y, w, h, OL)
  R(img, x + 2, y + 2, w - 4, h - 4, C(navy[1]))
  local gx, gy, gw, gh = x + 4, y + 4, w - 8, h - 8
  local bands = { "#f7d59a", "#f5c58a", "#f0b07a", "#e59a78" }
  local bh = math.ceil(gh / #bands)
  for i, c in ipairs(bands) do R(img, gx, gy + (i - 1) * bh, gw, bh, C(c)) end
  for i = 1, #bands - 1 do Dz(img, gx, gy + i * bh - 1, gw, 2, C(bands[i]), C(bands[i + 1])) end
  -- skyline
  local seed = 3
  for cx = gx, gx + gw - 6, 9 do
    seed = (seed * 7 + 5) % 11
    local bh2 = 8 + seed * 2
    R(img, cx, gy + gh - bh2, 8, bh2, "#b8877a")
  end
  if silhouettes then
    for cx = gx + 20, gx + gw - 30, 70 do
      R(img, cx, gy + gh - 26, 4, 22, "#a06f68")
      R(img, cx, gy + gh - 26, 18, 4, "#a06f68")
      R(img, cx + 14, gy + gh - 26, 4, 12, "#a06f68")
    end
  end
  R(img, x + w // 2 - 1, y + 2, 3, h - 4, C(navy[1]))
  R(img, x + 2, y + h // 2 - 1, w - 4, 3, C(navy[1]))
end

local function lampAt(img, x, y)
  R(img, x, 0, 1, y, "#39445a")
  R(img, x - 8, y, 17, 4, OL)
  R(img, x - 7, y, 15, 3, C(navy[1]))
  Dz(img, x - 14, y + 4, 29, 6, C("#f3e2b3"), C("#e6d6bd"))
  Dz(img, x - 8, y + 10, 17, 5, C("#f3e2b3"), C("#e6d6bd"))
end

local function baseBg(img, floorY)
  local bands = { { 0, "#d3c3aa" }, { floorY * 0.33, "#dccbb2" }, { floorY * 0.66, "#e5d4bb" } }
  R(img, 0, 0, 400, floorY, C(bands[1][2]))
  for i = 2, 3 do
    R(img, 0, bands[i][1], 400, floorY - bands[i][1], C(bands[i][2]))
    Dz(img, 0, bands[i][1] - 2, 400, 4, C(bands[i - 1][2]), C(bands[i][2]))
  end
  -- ceiling beam and posts
  R(img, 0, 0, 400, 9, C(navy[1]))
  R(img, 0, 8, 400, 2, C(navy[3]))
  R(img, 0, 0, 400, 2, C(navy[2]))
  -- baseboard
  R(img, 0, floorY - 5, 400, 5, "#8a8f99")
  -- floor
  R(img, 0, floorY, 400, 260 - floorY, "#c2bab2")
  for i = 0, 5 do
    local y = floorY + 6 + i * ((260 - floorY) // 6)
    Dz(img, 0, y, 400, 3, C("#c2bab2"), C("#d1cac2"))
  end
  for i = 0, 7 do R(img, 30 + i * 52, floorY + 12 + (i % 3) * 14, 22, 2, "#e6dfd8") end
end

local function floorLines(img, floorY)
  for i = 0, 400 do
    local y = floorY + 24 + i // 6
    if y < 258 then
      Px(img, i, y, "#f2b632")
      Px(img, i, y + 1, "#f2b632")
    end
  end
end

local function fence(img, x, w, y1, y2)
  for j = y1, y2 do
    for i = x, x + w - 1 do
      if (i % 4 == 0) or (j % 4 == 0) then Px(img, i, j, "#4a5a72") end
    end
  end
  R(img, x, y1, w, 3, C(navy[1]))
  local first = x - (x % 44)
  for px = first, x + w, 44 do
    if px >= x - 2 and px <= x + w - 4 then
      R(img, px, y1 - 2, 6, y2 - y1 + 4, OL)
      R(img, px + 1, y1 - 2, 4, y2 - y1 + 4, C(yellow[1]))
      R(img, px + 1, y1 - 2, 1, y2 - y1 + 4, C(yellow[2]))
      R(img, px + 4, y1 - 2, 1, y2 - y1 + 4, C(yellow[3]))
    end
  end
end

local function shelf(img, x, y, w, h, rows, boxes)
  R(img, x, y, 4, h, OL)
  R(img, x + 1, y, 2, h, C(navy[2]))
  R(img, x + w - 4, y, 4, h, OL)
  R(img, x + w - 3, y, 2, h, C(navy[2]))
  for r = 1, rows do
    local by = y + (h // rows) * r - 6
    R(img, x, by + 2, w, 4, OL)
    R(img, x + 1, by + 3, w - 2, 2, C(orange[1]))
    if boxes then
      local bx = x + 8
      local n = 0
      while bx + 16 < x + w - 6 do
        n = n + 1
        local bh = 12 + (n * 5) % 9
        Bx(img, bx, by + 2 - bh, 16, bh, { "#c39a63", "#dfb883", "#9a7546" })
        bx = bx + 19
      end
    end
  end
end

local function table_(img, x, y, w, h)
  Bx(img, x, y, w, 8, wood)
  R(img, x + 2, y + 8, w - 4, 6, C(dark[1]))
  Bx(img, x + 4, y + 14, 6, h - 14, steel)
  Bx(img, x + w - 10, y + 14, 6, h - 14, steel)
end

local function plant(img, x, y)
  Bx(img, x, y + 14, 14, 10, { "#8c5a3c", "#a8734f", "#5c3a24" })
  Disc(img, x + 7, y + 8, 8, green)
  Disc(img, x + 2, y + 12, 5, green)
  Disc(img, x + 12, y + 12, 5, green)
end

local function pegboard(img, x, y, w, h)
  Bx(img, x, y, w, h, { "#e9dcc2", "#f7edd6", "#c8b795" })
  for j = y + 4, y + h - 4, 6 do
    for i = x + 4, x + w - 4, 6 do Px(img, i, j, "#a8987a") end
  end
  for i = 0, 3 do
    R(img, x + 10 + i * 12, y + 8, 3, 18, "#48525f")
    R(img, x + 8 + i * 12, y + 8, 7, 4, "#48525f")
  end
end

local function bin(img, x, y, w, h, pal)
  Bx(img, x, y, w, h, pal, true)
  R(img, x + 3, y + 4, w - 6, 3, C(pal[3]))
  for i = 0, 3 do
    Bx(img, x + 6 + i * ((w - 20) // 3), y - 6 + (i % 2) * 2, 12, 10, pal, true)
  end
end

local function towerLight(img, x, y)
  R(img, x + 5, y + 12, 3, 20, OL)
  Bx(img, x, y, 13, 6, red)
  Bx(img, x, y + 6, 13, 6, yellow)
  R(img, x + 2, y + 1, 9, 2, "#ffb0a0")
end

local function cabinet(img, x, y, w, h)
  Bx(img, x, y, w, h, { "#8fa0b3", "#b6c4d2", "#5a6a7c" })
  Bx(img, x + 6, y + 8, w - 12, 12, navy)
  Disc(img, x + w - 12, y + 30, 4, red)
  for i = 0, 5 do R(img, x + 8, y + h - 24 + i * 3, w - 16, 1, "#4d5a6c") end
end

local function scene(name, draw)
  build("bg-" .. name, 400, 260, 1, function(img)
    draw(img)
    -- rounded corners leave transparent gaps; fill them from a neighbour so backgrounds stay solid
    for y = 0, img.height - 1 do
      for x = 0, img.width - 1 do
        if PX.rgbaA(img:getPixel(x, y)) == 0 then
          local n = (x > 0 and img:getPixel(x - 1, y)) or img:getPixel(x + 1, y)
          if PX.rgbaA(n) == 0 and y > 0 then n = img:getPixel(x, y - 1) end
          img:drawPixel(x, y, n)
        end
      end
    end
  end)
end

scene("articulated", function(img)
  baseBg(img, 196)
  window(img, 20, 22, 104, 64, false)
  lampAt(img, 290, 24)
  fence(img, 0, 400, 100, 196)
  floorLines(img, 196)
  cabinet(img, 8, 130, 54, 68)
  towerLight(img, 24, 96)
  table_(img, 310, 168, 80, 58)
  Bx(img, 322, 154, 18, 14, steel)
  Bx(img, 346, 158, 14, 10, steel)
end)

scene("scara", function(img)
  baseBg(img, 180)
  window(img, 36, 22, 110, 64, false)
  lampAt(img, 300, 22)
  pegboard(img, 258, 34, 84, 52)
  plant(img, 150, 56)
  fence(img, 0, 34, 60, 178)
  fence(img, 366, 34, 60, 178)
  towerLight(img, 10, 34)
  towerLight(img, 376, 34)
  floorLines(img, 180)
  R(img, 90, 234, 220, 22, C(dark[1]))
  for i = 0, 55 do R(img, 92 + i * 4, 236, 2, 18, C(dark[3])) end
  for i = 0, 27 do R(img, 92 + i * 8, 232, 4, 3, "#f2b632") end
end)

scene("delta", function(img)
  baseBg(img, 176)
  window(img, 218, 74, 120, 84, false)
  plant(img, 340, 130)
  shelf(img, 40, 70, 86, 96, 3, true)
  pegboard(img, 132, 90, 70, 60)
  lampAt(img, 120, 18)
  fence(img, 0, 30, 30, 176)
  fence(img, 370, 30, 30, 176)
  floorLines(img, 176)
  bin(img, -8, 200, 56, 46, blue)
  bin(img, 352, 200, 56, 46, red)
end)

scene("cartesian", function(img)
  baseBg(img, 186)
  window(img, 130, 22, 140, 74, false)
  shelf(img, 6, 60, 58, 110, 3, true)
  lampAt(img, 320, 20)
  cabinet(img, 336, 90, 60, 96)
  fence(img, 60, 8, 110, 184)
  fence(img, 330, 8, 110, 184)
  floorLines(img, 186)
  -- machining table under the gantry
  Bx(img, 56, 206, 288, 22, steel)
  for i = 0, 25 do R(img, 62 + i * 11, 212, 3, 3, "#48525f") end
  Bx(img, 88, 196, 70, 14, dark)
  Bx(img, 258, 196, 70, 14, dark)
end)

scene("humanoid", function(img)
  baseBg(img, 190)
  window(img, 70, 22, 260, 74, true)
  lampAt(img, 50, 20)
  lampAt(img, 350, 20)
  shelf(img, 4, 76, 62, 110, 3, true)
  floorLines(img, 190)
  bin(img, 8, 206, 84, 40, blue)
  table_(img, 300, 150, 92, 78)
  Bx(img, 316, 134, 16, 16, dark)
  Bx(img, 338, 138, 14, 12, steel)
  Bx(img, 362, 140, 18, 10, red)
  -- hazard strips on the floor
  for i = 0, 20 do R(img, 110 + i * 14, 212, 8, 4, "#f2b632") end
end)

scene("cobot", function(img)
  baseBg(img, 150)
  window(img, 12, 22, 116, 84, false)
  pegboard(img, 250, 34, 110, 64)
  lampAt(img, 200, 18)
  -- workbench surface
  Bx(img, 20, 166, 360, 68, wood)
  Dz(img, 24, 172, 352, 3, C(wood[2]), C(wood[1]))
  R(img, 24, 200, 352, 1, "#b98b4f")
  Bx(img, 20, 232, 360, 12, dark)
  Bx(img, 32, 244, 10, 16, steel)
  Bx(img, 358, 244, 10, 16, steel)
  -- trays on the bench
  Bx(img, 36, 208, 66, 20, dark, true)
  Bx(img, 300, 208, 70, 20, dark, true)
end)

local function hazardRect(img, x, y, w, h, th)
  for j = y, y + h - 1 do
    for i = x, x + w - 1 do
      local border = i < x + th or i >= x + w - th or j < y + th or j >= y + h - th
      if border then Px(img, i, j, (((i + j) // 5) % 2 == 0) and "#f2b632" or "#2a323d") end
    end
  end
end

local function rackTop(img, x, y, w, h)
  Bx(img, x, y, w, h, navy)
  R(img, x + 3, y + 3, w - 6, h - 6, C("#1d2d45"))
  local n = (w - 10) // 16
  for i = 0, n - 1 do
    local bx = x + 5 + i * 16
    Bx(img, bx, y + 5, 14, h - 10, cardboard)
    R(img, bx + 6, y + 5, 2, h - 10, C(cardboard[3]))
  end
  R(img, x, y + h - 3, w, 2, C(orange[1]))
end

scene("amr", function(img)
  -- concrete floor with painted tile joints
  R(img, 0, 0, 400, 260, "#cdc6bc")
  for x = 0, 400, 40 do R(img, x, 0, 1, 260, "#bfb7ab") end
  for y = 0, 260, 40 do R(img, 0, y, 400, 1, "#bfb7ab") end
  for i = 0, 40 do
    Dz(img, (i * 53) % 380, (i * 37) % 240, 18, 6, C("#cdc6bc"), C("#c6beb2"))
  end
  Dz(img, 0, 0, 400, 3, C("#8d8577"), C("#a79f92"))

  -- racks along the top
  rackTop(img, 14, 14, 164, 44)
  rackTop(img, 192, 14, 92, 44)
  -- pallet stacks in the lower right
  Bx(img, 296, 186, 40, 30, wood)
  Bx(img, 300, 190, 32, 22, cardboard)
  Bx(img, 342, 194, 38, 30, wood)
  Bx(img, 346, 198, 30, 22, cardboard)
  Bx(img, 300, 224, 36, 26, wood)
  Bx(img, 304, 228, 28, 18, cardboard)

  -- charging pad (home)
  R(img, 30, 186, 76, 44, "#b9c9b1")
  hazardRect(img, 30, 186, 76, 44, 4)
  R(img, 62, 196, 12, 24, C(yellow[1]))
  R(img, 66, 200, 4, 16, C(dark[1]))

  -- safety checkpoint gate
  R(img, 192, 116, 56, 56, "#d9d3c8")
  hazardRect(img, 192, 116, 56, 56, 4)
  Bx(img, 194, 124, 8, 40, navy)
  Bx(img, 238, 124, 8, 40, navy)
  for i = 0, 5 do R(img, 204 + i * 6, 143, 3, 2, C(red[1])) end

  -- dock
  Bx(img, 298, 6, 78, 20, dark)
  R(img, 306, 12, 62, 4, blink[1])
  R(img, 298, 26, 78, 76, "#a8a196")
  hazardRect(img, 298, 26, 78, 76, 4)
  Bx(img, 314, 44, 46, 18, steel)
  Bx(img, 314, 70, 46, 18, steel)
  R(img, 334, 48, 6, 10, C(yellow[1]))
  R(img, 334, 74, 6, 10, C(yellow[1]))
end)
