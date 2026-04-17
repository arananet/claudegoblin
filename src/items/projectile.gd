extends Area2D

# Lance/spear projectile thrown by Claude

const SPEED := 280.0
const MAX_RANGE := 400.0

var direction := 1.0
var _distance_traveled := 0.0


func _ready() -> void:
	body_entered.connect(_on_body_entered)
	area_entered.connect(_on_area_entered)


func _physics_process(delta: float) -> void:
	var travel := SPEED * delta
	position.x += direction * travel
	_distance_traveled += travel

	if _distance_traveled >= MAX_RANGE:
		queue_free()


func _on_body_entered(body: Node2D) -> void:
	if body.is_in_group("enemies"):
		body.take_hit()
		queue_free()


func _on_area_entered(area: Area2D) -> void:
	if area.is_in_group("enemy_hitbox"):
		area.get_parent().take_hit()
		queue_free()
