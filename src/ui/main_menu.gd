extends Control

@onready var start_label: Label = $StartLabel
var _blink_timer := 0.0
const BLINK_INTERVAL := 0.6


func _process(delta: float) -> void:
	_blink_timer += delta
	if _blink_timer >= BLINK_INTERVAL:
		_blink_timer = 0.0
		start_label.visible = not start_label.visible


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("jump") or event.is_action_pressed("attack"):
		get_tree().change_scene_to_file("res://src/levels/level_1.tscn")
