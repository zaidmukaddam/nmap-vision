import { OpenAIStream, StreamingTextResponse } from "ai";
import { OpenAI } from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { photo } = await request.json();

  const output = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "system",
        content: `You are a NMAP Tool expert. You will be given a image of nmap scan output and you have to give the analysis of the scan in the following format:
        ### Scan Summary
        - **Host**:
        - **IP Address**:
        - **Nmap Version**: ...
        - **Scan Year**: ...
        - **Command Executed**: // script used
        - **Better Command Suggestion**: // give a better script suggestion

        ### Identified Ports
        - **Port 22 (TCP)**
          - **Service**: SSH
          - **Usage**: Secure logins, file transfers (scp, sftp), port forwarding
        - **Port 80 (TCP)**
          - **Service**: HTTP
          - **Usage**: Serving web pages
        - **Port 139 (TCP)**
          - **Service**: NetBIOS-SSN
          - **Usage**: Windows networking services like file sharing and printing
        - **Port 445 (TCP)**
          - **Service**: Microsoft-DS
          - **Usage**: Windows file sharing and some Windows services
        - **Port 631 (TCP)**
          - **Service**: IPP
          - **Usage**: Network printer sharing
        - **Port 3306 (TCP)**
          - **Service**: MySQL
          - **Usage**: MySQL database server

        ### Security Analysis (This is the expected outline, some of the explanations may be missing but all the points should be covered)
        - **Assessment**
          - **Service Intentionality**
          - **Configuration Review**
          - **Unnecessary Services**
        - **Service Patching**
          - **Outdated Services**
        - **Access Control**
          - **Firewall Rules**
          - **Authentication**
          - **Traffic Encryption**
        - **System Monitoring**
          - **Scan Schedule**
          - **System Logs**
        - **Additional Scans()**
          - Perform detailed Nmap scan with '-sV' flag to detect service versions. (Service version detection is not enabled by default.)
          - Use '--script' flag with Nmap for NSE scripts and further service enumeration. Give the vulnerabilities script in a sentence (https://nmap.org/book/nse.html)

        ### Recommendations(List of Recommendation)
         -`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: photo ?? "",
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
  });

  const visionOutput = output.choices[0].message.content;

  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a NMAP Tool expert. You will be description of image of nmap scan output and you have to give the analysis of the scan and give a JSON output like this:
        {
          "scanSummary": {
            "targetInformation": {
              "host": "localhost",
              "ipAddress": "127.0.0.1",
              "nmapVersion": "4.20",
              "scanYear": 2007
            },
            "commandExecuted": "nmap [options] [target]",
            "betterCommandSuggestion": "nmap -sV --script [target]"
          },
          "identifiedPorts": {
            "portDetails": [
              {
                "port": 22,
                "protocol": "tcp",
                "service": "SSH",
                "usage": "secure logins, file transfers (scp, sftp), port forwarding"
              },
              {
                "port": 80,
                "protocol": "tcp",
                "service": "HTTP",
                "usage": "serving web pages"
              },
              {
                "port": 139,
                "protocol": "tcp",
                "service": "NetBIOS-SSN",
                "usage": "Windows networking services like file sharing and printing"
              },
              {
                "port": 445,
                "protocol": "tcp",
                "service": "Microsoft-DS",
                "usage": "Windows file sharing and some Windows services"
              },
              {
                "port": 631,
                "protocol": "tcp",
                "service": "IPP",
                "usage": "network printer sharing"
              },
              {
                "port": 3306,
                "protocol": "tcp",
                "service": "MySQL",
                "usage": "MySQL database server"
              }
            ]
          },
          "securityAnalysis": {
            "assessment": {
              "serviceIntentionality": "Ensure each service is intentionally running and required for functionality.",
              "configurationReview": "Review configurations to ensure they are properly secured.",
              "unnecessaryServices": "Check and consider stopping unnecessary services to reduce attack surface."
            },
            "servicePatching": {
              "outdatedServices": "Given the scan is from 2007, update all services to patch vulnerabilities."
            },
            "accessControl": {
              "firewallRules": "Implement rules to limit access to services from authorized networks/IP addresses only.",
              "authentication": "Use strong passwords and key-based authentication for SSH.",
              "trafficEncryption": "Enable HTTPS for web services to encrypt traffic."
            },
            "systemMonitoring": {
              "scanSchedule": "Regularly scan the machine to detect unauthorized changes to open ports.",
              "trafficMonitoring": "Monitor network traffic to and from these ports for suspicious activity."
            },
            "additionalScans": {
              "serviceVersionDetection": "Perform detailed Nmap scan with '-sV' flag to detect service versions.",
              "vulnerabilityEnumeration": "Use '--script' flag with Nmap for NSE scripts and further service enumeration."
            }
          },
          "recommendations": {
            "updateNmap": "Update the version of Nmap to the latest for improved service detection.",
            "performSecurityAssessment": "Follow the security assessment recommendations provided.",
            "implementAccessControl": "Implement suggested access control measures.",
            "conductMonitoring": "Carry out monitoring as advised.",
            "executeAdditionalScans": "Perform additional scans for in-depth vulnerability assessment."
          }
        }`,
      },
      {
        role: "user",
        content: visionOutput,
      },
    ],
    stream: true,
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
