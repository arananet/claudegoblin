extends CharacterBody2D

# Basic zombie enemy — walks toward the player, 1 hit to kill

const WALK_SPEED := 50.0

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var hitbox: Area2D = $Hitbox

var player: CharacterBody2D = null


func _ready() -> void:
	hitbox.body_entered.connect(_on_hitbox_body_entered)
	sprite.play("walk")


func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y += ProjectSettings.get_setting("physics/2d/default_gravity") * delta

	if player:
		var dir := sign(player.global_position.x - global_position.x)
		velocity.x = dir * WALK_SPEED
		sprite.flip_h = dir < 0
	else:
		velocity.x = move_toward(velocity.x, 0, WALK_SPEED)

	move_and_slide()


func _on_hitbox_body_entered(body: Node2D) -> void:
	if body.is_in_group("player"):
		body.take_hit()


func take_hit() -> void:
	sprite.play("death")
	set_physics_process(false)
	hitbox.set_deferred("monitoring", false)
	await sprite.animation_finished
	queue_free()
