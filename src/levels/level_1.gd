extends Node2D

# Level 1 — graveyard stage, faithful Ghost 'n Goblins opener

signal level_complete

@onready var player: CharacterBody2D = $Player
@onready var hud: CanvasLayer = $HUD
@onready var level_end_area: Area2D = $LevelEndArea
@onready var enemy_spawner: Node2D = $EnemySpawner
@onready var game_over_screen: CanvasLayer = $GameOverScreen

var _score := 0


func _ready() -> void:
	player.add_to_group("player")
	player.life_lost.connect(_on_life_lost)
	player.game_over.connect(_on_game_over)
	player.armor_changed.connect(hud.update_armor)

	level_end_area.body_entered.connect(_on_level_end_entered)
	hud.update_lives(player.lives)
	hud.update_score(_score)
	game_over_screen.hide()

	# Give enemies a reference to the player for tracking
	for enemy in enemy_spawner.get_children():
		if enemy.has_method("set"):
			enemy.player = player


func _on_life_lost(lives: int) -> void:
	hud.update_lives(lives)


func _on_game_over() -> void:
	game_over_screen.show()


func _on_level_end_entered(body: Node2D) -> void:
	if body.is_in_group("player"):
		emit_signal("level_complete")
		hud.show_level_complete()


func add_score(points: int) -> void:
	_score += points
	hud.update_score(_score)
