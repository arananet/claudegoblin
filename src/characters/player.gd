extends CharacterBody2D

# Claude's two-hit armor system (faithful to Ghost 'n Goblins)
enum ArmorState { ARMORED, UNARMORED }

const MOVE_SPEED := 120.0
const JUMP_VELOCITY := -400.0
const INVINCIBILITY_DURATION := 2.0

signal life_lost(lives_remaining: int)
signal game_over
signal armor_changed(new_state: ArmorState)

@export var max_lives := 3

var armor_state := ArmorState.ARMORED
var lives := max_lives
var is_invincible := false
var is_dead := false
var facing_right := true

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var invincibility_timer: Timer = $InvincibilityTimer
@onready var projectile_scene := preload("res://src/items/projectile.tscn")
@onready var projectile_spawn: Marker2D = $ProjectileSpawn


func _ready() -> void:
	invincibility_timer.wait_time = INVINCIBILITY_DURATION
	invincibility_timer.one_shot = true
	invincibility_timer.timeout.connect(_on_invincibility_expired)
	_update_animation()


func _physics_process(delta: float) -> void:
	if is_dead:
		return

	_apply_gravity(delta)
	_handle_movement()
	_handle_jump()
	move_and_slide()
	_update_animation()


func _unhandled_input(event: InputEvent) -> void:
	if is_dead:
		return
	if event.is_action_pressed("attack"):
		_throw_projectile()


func _apply_gravity(delta: float) -> void:
	if not is_on_floor():
		velocity.y += ProjectSettings.get_setting("physics/2d/default_gravity") * delta


func _handle_movement() -> void:
	var direction := 0.0
	if Input.is_action_pressed("move_right"):
		direction = 1.0
		facing_right = true
		sprite.flip_h = false
	elif Input.is_action_pressed("move_left"):
		direction = -1.0
		facing_right = false
		sprite.flip_h = true

	# Direction locked while airborne (Ghost 'n Goblins authentic mechanic)
	if is_on_floor():
		velocity.x = direction * MOVE_SPEED
	# No horizontal change mid-air


func _handle_jump() -> void:
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = JUMP_VELOCITY


func _throw_projectile() -> void:
	var projectile := projectile_scene.instantiate()
	get_parent().add_child(projectile)
	projectile.global_position = projectile_spawn.global_position
	projectile.direction = 1.0 if facing_right else -1.0


func take_hit() -> void:
	if is_invincible or is_dead:
		return

	if armor_state == ArmorState.ARMORED:
		armor_state = ArmorState.UNARMORED
		emit_signal("armor_changed", armor_state)
		_start_invincibility()
	else:
		_lose_life()


func pickup_armor() -> void:
	armor_state = ArmorState.ARMORED
	emit_signal("armor_changed", armor_state)
	_update_animation()


func _lose_life() -> void:
	lives -= 1
	emit_signal("life_lost", lives)
	if lives <= 0:
		is_dead = true
		emit_signal("game_over")
		_play_death()
	else:
		armor_state = ArmorState.ARMORED
		_start_invincibility()
		emit_signal("armor_changed", armor_state)


func _start_invincibility() -> void:
	is_invincible = true
	sprite.modulate.a = 0.4
	invincibility_timer.start()


func _on_invincibility_expired() -> void:
	is_invincible = false
	sprite.modulate.a = 1.0


func _play_death() -> void:
	sprite.play("death")


func _update_animation() -> void:
	if is_dead:
		return
	var prefix := "armored_" if armor_state == ArmorState.ARMORED else "naked_"
	if not is_on_floor():
		sprite.play(prefix + "jump")
	elif abs(velocity.x) > 1.0:
		sprite.play(prefix + "run")
	else:
		sprite.play(prefix + "idle")
