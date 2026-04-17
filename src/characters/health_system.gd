class_name HealthSystem
extends RefCounted

# Standalone health logic — easy to unit test without a scene

enum ArmorState { ARMORED, UNARMORED }

signal armor_changed(state: ArmorState)
signal life_lost(lives: int)
signal game_over

var armor_state := ArmorState.ARMORED
var lives: int

func _init(starting_lives: int = 3) -> void:
	lives = starting_lives


func take_hit() -> void:
	if armor_state == ArmorState.ARMORED:
		armor_state = ArmorState.UNARMORED
		emit_signal("armor_changed", armor_state)
	else:
		_lose_life()


func pickup_armor() -> void:
	armor_state = ArmorState.ARMORED
	emit_signal("armor_changed", armor_state)


func _lose_life() -> void:
	lives -= 1
	emit_signal("life_lost", lives)
	if lives <= 0:
		emit_signal("game_over")
	else:
		armor_state = ArmorState.ARMORED
		emit_signal("armor_changed", armor_state)
