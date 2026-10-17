
using MediatR;

namespace Daycare.Api.Features.Children.Commands;

public record DeleteChildCommand(int Id) : IRequest<DeleteChildResult>;

public record DeleteChildResult(
    bool Success,
    bool NotFound = false
);
