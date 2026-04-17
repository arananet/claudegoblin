extends CharacterBody2D

# Flying Knight — sine-wave flight path toward the player

const HORIZONTAL_SPEED := 60.0
const AMPLITUDE := 40.0
const FREQUENCY := 2.0

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var hitbox: Area2D = $Hitbox

var player: CharacterBody2D = null
var _time := 0.0
var _start_y := 0.0


func _ready() -> void:
	_start_y = global_position.y
	hitbox.body_entered.connect(_on_hitbox_body_entered)
	sprite.play("fly")


func _physics_process(delta: float) -> void:
	_time += delta

	if player:
		var dir := sign(player.global_position.x - global_position.x)
		position.x += dir * HORIZONTAL_SPEED * delta
		sprite.flip_h = dir < 0

	position.y = _start_y + sin(_time * FREQUENCY) * AMPLITUDE


func _on_hitbox_body_entered(body: Node2D) -> void:
	if body.is_in_group("player"):
		body.take_hit()


func take_hit() -> void:
	sprite.play("death")
	set_physics_process(false)
	hitbox.set_deferred("monitoring", false)
	await sprite.animation_finished
	queue_free()
