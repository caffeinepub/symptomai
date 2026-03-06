import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";

actor {
  type History = {
    id : Nat;
    timestamp : Time.Time;
    symptoms : Text;
    disease : Text;
    cause : Text;
    precautions : Text;
  };

  type UserHistory = {
    nextId : Nat;
    histories : [History];
  };

  let histories = Map.empty<Principal, UserHistory>();

  func getUserHistory(caller : Principal) : UserHistory {
    switch (histories.get(caller)) {
      case (null) { { nextId = 0; histories = [] } };
      case (?userHistory) { userHistory };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func analyzeSymptoms(symptoms : Text) : async Nat {
    let url = "https://external-ai-api.com/analyze?symptoms=" # symptoms;
    let response = await OutCall.httpGetRequest(url, [], transform);

    // Here, you would parse the response and extract disease, cause, and precautions.
    // As JSON parsing is not natively supported in the backend, we expect the frontend to handle this part.

    let userHistory = getUserHistory(caller);
    let newHistory : History = {
      id = userHistory.nextId;
      timestamp = Time.now();
      symptoms;
      disease = "Response to be replaced by frontend";
      cause = "Response to be replaced by frontend";
      precautions = "Response to be replaced by frontend";
    };

    let updatedHistories = userHistory.histories.concat([newHistory]);
    histories.add(caller, { nextId = userHistory.nextId + 1; histories = updatedHistories });
    newHistory.id;
  };

  public query ({ caller }) func getHistory() : async [History] {
    getUserHistory(caller).histories;
  };

  public shared ({ caller }) func clearHistory() : async () {
    histories.remove(caller);
  };
};
