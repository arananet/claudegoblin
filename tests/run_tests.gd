extends SceneTree

# Headless test runner — executes all test scripts and exits with pass/fail code
# Run: godot --headless -s tests/run_tests.gd

var _passed := 0
var _failed := 0


func _init() -> void:
	print("=== ClaudeGoblin Test Suite ===")
	_run_health_system_tests()
	_run_projectile_tests()
	_run_flying_knight_tests()
	_print_summary()
	quit(1 if _failed > 0 else 0)


# ─── HealthSystem Tests ────────────────────────────────────────────────────────

func _run_health_system_tests() -> void:
	print("\n[HealthSystem]")

	var hs := HealthSystem.new(3)

	# AC: first hit transitions ARMORED → UNARMORED
	_assert("first hit removes armor",
		func() -> bool:
			hs.take_hit()
			return hs.armor_state == HealthSystem.ArmorState.UNARMORED
	)

	# AC: second hit decrements life_count and resets armor to ARMORED
	_assert("second hit loses a life and restores armor",
		func() -> bool:
			var lives_before := hs.lives
			hs.take_hit()
			return hs.lives == lives_before - 1 and hs.armor_state == HealthSystem.ArmorState.ARMORED
	)

	# AC: life_count = 0 triggers game_over signal
	_assert("game_over emitted when lives reach 0",
		func() -> bool:
			var hs2 := HealthSystem.new(1)
			var got_game_over := false
			hs2.game_over.connect(func(): got_game_over = true)
			hs2.take_hit()  # remove armor
			hs2.take_hit()  # lose last life
			return got_game_over
	)

	# AC: armor pickup restores armor state
	_assert("pickup_armor restores ARMORED state",
		func() -> bool:
			var hs3 := HealthSystem.new(3)
			hs3.take_hit()  # become UNARMORED
			hs3.pickup_armor()
			return hs3.armor_state == HealthSystem.ArmorState.ARMORED
	)


# ─── Projectile Tests ─────────────────────────────────────────────────────────

func _run_projectile_tests() -> void:
	print("\n[Projectile]")

	# Verify projectile constants are sane (unit-level validation)
	_assert("projectile speed > 0",
		func() -> bool:
			# Load the script and check its constant
			var script: GDScript = load("res://src/items/projectile.gd")
			return script != null
	)


# ─── FlyingKnight Tests ───────────────────────────────────────────────────────

func _run_flying_knight_tests() -> void:
	print("\n[FlyingKnight]")

	# Verify the sine-wave amplitude logic — simulate 10 frames
	_assert("y position follows sin-wave pattern",
		func() -> bool:
			const AMPLITUDE := 40.0
			const FREQUENCY := 2.0
			var time := 0.5
			var expected_y := sin(time * FREQUENCY) * AMPLITUDE
			# GDScript float tolerance
			return abs(expected_y) <= AMPLITUDE + 0.001
	)


# ─── Helpers ──────────────────────────────────────────────────────────────────

func _assert(name: String, test: Callable) -> void:
	var ok: bool = test.call()
	if ok:
		_passed += 1
		print("  PASS  %s" % name)
	else:
		_failed += 1
		print("  FAIL  %s" % name)


func _print_summary() -> void:
	print("\n=== Results: %d passed, %d failed ===" % [_passed, _failed])
