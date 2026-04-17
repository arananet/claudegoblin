extends Area2D

# Armor pickup — restores Claude's armor when walked over

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D


func _ready() -> void:
	body_entered.connect(_on_body_entered)
	sprite.play("idle")


func _on_body_entered(body: Node2D) -> void:
	if body.is_in_group("player"):
		body.pickup_armor()
		queue_free()
