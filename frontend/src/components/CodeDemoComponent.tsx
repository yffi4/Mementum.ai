import React from "react";
import NoteRenderer from "./NoteRenderer";

const CodeDemoComponent: React.FC = () => {
  const demoContent = `# Демонстрация красивого форматирования кода

Теперь любой код программирования отображается как в редакторе кода с красивой подсветкой синтаксиса!

## C++ код
\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    // Creating a map of integer keys and string values
    map<int, string> m {{1, "Geeks"}, {2, "For"}, {3, "Geeks"}};
    
    for (auto& p : m) {
        cout << p.first << " " << p.second << "\\n";
    }
    
    return 0;
}
\`\`\`

## Python код
\`\`\`python
def fibonacci(n):
    """Генерирует последовательность Фибоначчи"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Пример использования
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

## JavaScript/TypeScript
\`\`\`typescript
interface User {
    id: number;
    name: string;
    email: string;
}

class UserService {
    private users: User[] = [];
    
    async createUser(userData: Omit<User, 'id'>): Promise<User> {
        const newUser: User = {
            id: this.users.length + 1,
            ...userData
        };
        
        this.users.push(newUser);
        return newUser;
    }
    
    getUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }
}
\`\`\`

## Java код
\`\`\`java
public class QuickSort {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }
    
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = (low - 1);
        
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        
        return i + 1;
    }
}
\`\`\`

## SQL запрос
\`\`\`sql
SELECT 
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.total_amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 10;
\`\`\`

## Bash скрипт
\`\`\`bash
#!/bin/bash

# Функция для проверки статуса сервиса
check_service() {
    local service_name=$1
    
    if systemctl is-active --quiet "$service_name"; then
        echo "✅ $service_name is running"
        return 0
    else
        echo "❌ $service_name is not running"
        return 1
    fi
}

# Проверяем несколько сервисов
services=("nginx" "mysql" "redis")

for service in "\${services[@]}"; do
    check_service "$service"
done
\`\`\`

## Возможности форматирования

- **Номера строк** для удобной навигации
- **Копирование кода** одним кликом
- **Красивые цвета** для разных элементов синтаксиса
- **Поддержка всех популярных языков**: Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, PHP, Ruby и многие другие!
- **Инлайн код** также красиво оформлен: \`const variable = "value"\`

> Теперь ваши заметки с кодом выглядят как в профессиональном редакторе кода!`;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg">
      <NoteRenderer content={demoContent} />
    </div>
  );
};

export default CodeDemoComponent;
