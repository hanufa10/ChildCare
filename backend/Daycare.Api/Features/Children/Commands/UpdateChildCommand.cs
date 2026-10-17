
using Daycare.Api.Models;
using MediatR;

namespace Daycare.Api.Features.Children.Commands;

public record UpdateChildCommand(
    int Id,
    Child Child,
    bool IsAdminOrStaff,
    bool IsParent,
    string? UserId
) : IRequest<UpdateChildResult>;

public record UpdateChildResult(
    bool Success,
    bool NotFound = false,
    bool Forbidden = false,
    string? Error = null
);
