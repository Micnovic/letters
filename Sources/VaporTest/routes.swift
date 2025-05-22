import Vapor

func routes(_ app: Application) throws {
    app.get { req async throws -> View in
        try await req.view.render("hello", SolarSystem())
    }

    app.get("hello") { req -> View in
        try await req.view.render("hello", SolarSystem())
    }
    
    app.webSocket("game") { req, ws in
        // Add the WebSocket to the connected clients
        Task {
            await WebSocketManager.shared.add(ws)
            //let message = await lettersToJSON(letters)
            for (key, letter) in await letters {
                await WebSocketManager.shared.broadcast(message: letterToJSON(letter))
            }
        }
       
       // Handle incoming messages
       ws.onText { ws, text in
           // Broadcast the received message to all connected clients
           Task {
               if let letter = JSONStringToLetter(text) {
                   if #available(macOS 15.0, *) {
                       Task { @MainActor in letters[letter.char] = letter }
                       await WebSocketManager.shared.broadcast(message: letterToJSON(letter))
                   } else {
                       // Fallback on earlier versions
                   }
               } else {
                   print("could not convert: \(text)")
               }
//               await WebSocketManager.shared.broadcast(message: text)
           }
       }
       
       // Remove the WebSocket when the connection is closed
       ws.onClose.whenComplete { _ in
           Task {
               await WebSocketManager.shared.remove(ws)
           }
       }
    }
    
}

struct SolarSystem: Encodable {
    let planets = ["Venus", "Earth", "Mars"]
    
}


@MainActor
class WebSocketManager {
    static let shared = WebSocketManager()
    private var clients: [WebSocket] = []

    func add(_ ws: WebSocket) {
        clients.append(ws)
    }

    func remove(_ ws: WebSocket) {
        clients.removeAll { $0 === ws }
    }

    func broadcast(message: String) {
        print("broadcasting: \(message)")
        for client in clients {
            client.send(message)
        }
    }
}

func JSONStringToLetter(_ jsonString: String) -> Letter? {
    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .useDefaultKeys
 
    do {
        let letter = try JSONDecoder().decode(Letter.self, from: jsonString.data(using: .utf8)!)
        return letter
    } catch {
        print("Error decoding JSON: \(error)")
    }
    
    return nil
}
