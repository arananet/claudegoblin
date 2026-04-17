extends CanvasLayer

@onready var lives_label: Label = $Lives
@onready var score_label: Label = $Score
@onready var armor_label: Label = $ArmorStatus
@onready var level_complete_label: Label = $LevelComplete


func _ready() -> void:
	level_complete_label.hide()


func update_lives(lives: int) -> void:
	lives_label.text = "LIVES: %d" % lives


func update_score(score: int) -> void:
	score_label.text = "SCORE: %06d" % score


func update_armor(armor_state: int) -> void:
	armor_label.text = "ARMOR: %s" % ("YES" if armor_state == 0 else "NO")


func show_level_complete() -> void:
	level_complete_label.show()
