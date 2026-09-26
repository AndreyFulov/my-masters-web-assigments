package service

import (
	"bufio"
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
func (l *ActionLogger) GetLogs(limit int) ([]UserAction, error) {
	l.mu.Lock()
	defer l.mu.Unlock()

	file, err := os.Open(l.filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return []UserAction{}, nil
		}
		return nil, err
	}
	defer file.Close()

	var logs []UserAction
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Bytes()
		if len(line) == 0 {
			continue
		}
		var entry UserAction
		if err := json.Unmarshal(line, &entry); err == nil {
			logs = append(logs, entry)
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	// Reverse to show newest logs first
	for i, j := 0, len(logs)-1; i < j; i, j = i+1, j-1 {
		logs[i], logs[j] = logs[j], logs[i]
	}

	if limit > 0 && len(logs) > limit {
		logs = logs[:limit]
	}

	return logs, nil
}
