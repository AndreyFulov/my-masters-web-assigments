package service

import (
	"encoding/json"
	"os"
	"sync"
	"time"
)

type UserAction struct {
	Timestamp string                 `json:"timestamp"`
	Action    string                 `json:"action"` // e.g. "add_to_cart", "remove_from_cart", "place_order"
	UserIP    string                 `json:"user_ip"`
	Payload   map[string]interface{} `json:"payload"`
}

type ActionLogger struct {
	filePath string
	mu       sync.Mutex
}

func NewActionLogger(filePath string) *ActionLogger {
	return &ActionLogger{filePath: filePath}
}

func (l *ActionLogger) Log(action string, ip string, payload map[string]interface{}) error {
	l.mu.Lock()
	defer l.mu.Unlock()

	entry := UserAction{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Action:    action,
		UserIP:    ip,
		Payload:   payload,
	}

	data, err := json.Marshal(entry)
	if err != nil {
		return err
	}

	// Open file in append-only mode (creates file if it doesn't exist)
	f, err := os.OpenFile(l.filePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	defer f.Close()

	// Write JSON line with newline
	data = append(data, '\n')
	_, err = f.Write(data)
	return err
}
